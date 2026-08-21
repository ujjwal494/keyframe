import dbConnect from "@/lib/mongodb";
import Answer from "@/app/models/answer";
import Question from "@/app/models/question";
import User from "@/app/models/user";
import { AcceptedAnswerStrategy, AcceptedQuestionStrategy } from "@/lib/reputation";

const acceptedAnswerStrategy = new AcceptedAnswerStrategy();
const acceptedQuestionStrategy = new AcceptedQuestionStrategy();

/**
 * AnswerRepository — data-access layer for answers.
 * Keeps Mongoose queries out of route handlers so logic stays testable and reusable.
 */
const AnswerRepository = {
  /**
   * Create a new answer and atomically increment the parent question's answerCount.
   * @param {{ body: string, author: string, question: string, media?: Array }} data
   */
  async create(data) {
    await dbConnect();

    const answer = await Answer.create(data);

    // Atomically bump the answerCount on the parent question
    await Question.findByIdAndUpdate(data.question, {
      $inc: { answerCount: 1 },
    });

    return answer;
  },

  /**
   * Fetch all answers for a given question, sorted by accepted first, then by vote score.
   * Populates the author profile for each answer.
   */
  async listByQuestion(questionId, { page = 1, limit = 20 } = {}) {
    await dbConnect();

    const skip = (page - 1) * limit;

    const [answers, total] = await Promise.all([
      Answer.find({ question: questionId })
        .sort({ isAccepted: -1, voteScore: -1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "username displayName profilePic reputation")
        .lean(),
      Answer.countDocuments({ question: questionId }),
    ]);

    return {
      answers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Find a single answer by its ID.
   */
  async findById(id) {
    await dbConnect();
    return Answer.findById(id).populate("author", "username displayName profilePic reputation");
  },

  /**
   * Accept (or un-accept) an answer.
   *
   * Uses individual atomic operations (each findByIdAndUpdate is atomic at the
   * document level). No multi-document transaction required — works on standalone
   * MongoDB servers without a replica set.
   *
   * Business rules:
   * 1. Only the question author can accept/un-accept answers.
   * 2. Clicking the same answer again toggles it off (un-accept).
   * 3. Clicking a different answer switches the accepted answer.
   * 4. Reputation: answer author gets +15 (accept) or -15 (un-accept),
   *    question author gets +5 (accept) or -5 (un-accept).
   *
   * @param {string} questionId — The question's ObjectId
   * @param {string} answerId  — The answer's ObjectId
   * @param {string} userId    — The authenticated user's ID
   * @returns {{ accepted: boolean, answerId: string }}
   */
  async acceptAnswer(questionId, answerId, userId) {
    await dbConnect();

    // ── 1. Load the question and verify ownership ──────────────────
    const question = await Question.findById(questionId);
    if (!question) {
      throw Object.assign(new Error("Question not found."), { statusCode: 404 });
    }

    if (question.author.toString() !== userId.toString()) {
      throw Object.assign(
        new Error("Only the question author can accept an answer."),
        { statusCode: 403 }
      );
    }

    // ── 2. Load the target answer and verify it belongs to this question ──
    const answer = await Answer.findById(answerId);
    if (!answer) {
      throw Object.assign(new Error("Answer not found."), { statusCode: 404 });
    }

    if (answer.question.toString() !== questionId.toString()) {
      throw Object.assign(
        new Error("This answer does not belong to the specified question."),
        { statusCode: 400 }
      );
    }

    // Reputation deltas computed from strategies
    const answerAuthorRep = acceptedAnswerStrategy.calculate();   // +15
    const questionAuthorRep = acceptedQuestionStrategy.calculate(); // +5

    let accepted;

    // ── 3. Determine the action: toggle, switch, or first-accept ──
    if (answer.isAccepted) {
      // ── TOGGLE OFF: un-accept the currently accepted answer ──
      await Answer.findByIdAndUpdate(answerId, { $set: { isAccepted: false } });
      await Question.findByIdAndUpdate(questionId, { $set: { acceptedAnswer: null } });

      // Reverse reputation
      await User.findByIdAndUpdate(answer.author, { $inc: { reputation: -answerAuthorRep } });
      await User.findByIdAndUpdate(question.author, { $inc: { reputation: -questionAuthorRep } });

      accepted = false;
    } else {
      // If a different answer was previously accepted, un-accept it first
      if (question.acceptedAnswer) {
        const oldAnswer = await Answer.findById(question.acceptedAnswer);
        if (oldAnswer) {
          await Answer.findByIdAndUpdate(oldAnswer._id, { $set: { isAccepted: false } });

          // Reverse the old answer author's reputation
          await User.findByIdAndUpdate(oldAnswer.author, { $inc: { reputation: -answerAuthorRep } });
          // Reverse the question author's curating bonus for the old accept
          await User.findByIdAndUpdate(question.author, { $inc: { reputation: -questionAuthorRep } });
        }
      }

      // Accept the new answer
      await Answer.findByIdAndUpdate(answerId, { $set: { isAccepted: true } });
      await Question.findByIdAndUpdate(questionId, { $set: { acceptedAnswer: answer._id } });

      // Award reputation
      await User.findByIdAndUpdate(answer.author, { $inc: { reputation: answerAuthorRep } });
      await User.findByIdAndUpdate(question.author, { $inc: { reputation: questionAuthorRep } });

      accepted = true;
    }

    return { accepted, answerId: answer._id };
  },
};

export default AnswerRepository;
