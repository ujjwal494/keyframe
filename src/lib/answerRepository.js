import mongoose from "mongoose";
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
   * Wrapped in a transaction so that both writes succeed or neither does.
   *
   * @param {{ body: string, author: string, question: string, media?: Array }} data
   */
  async create(data) {
    await dbConnect();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create the answer within the transaction
      const [answer] = await Answer.create([data], { session });

      // Atomically bump the answerCount on the parent question
      await Question.findByIdAndUpdate(
        data.question,
        { $inc: { answerCount: 1 } },
        { session }
      );

      await session.commitTransaction();
      return answer;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
   * Wrapped in a multi-document transaction so all writes (answer flags,
   * question state, reputation adjustments) succeed or fail as a unit.
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

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // ── 1. Load the question and verify ownership ──────────────────
      const question = await Question.findById(questionId).session(session);
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
      const answer = await Answer.findById(answerId).session(session);
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
        await Answer.findByIdAndUpdate(answerId, { $set: { isAccepted: false } }, { session });
        await Question.findByIdAndUpdate(questionId, { $set: { acceptedAnswer: null } }, { session });

        // Reverse reputation
        await User.findByIdAndUpdate(answer.author, { $inc: { reputation: -answerAuthorRep } }, { session });
        await User.findByIdAndUpdate(question.author, { $inc: { reputation: -questionAuthorRep } }, { session });

        accepted = false;
      } else {
        // If a different answer was previously accepted, un-accept it first
        if (question.acceptedAnswer) {
          const oldAnswer = await Answer.findById(question.acceptedAnswer).session(session);
          if (oldAnswer) {
            await Answer.findByIdAndUpdate(oldAnswer._id, { $set: { isAccepted: false } }, { session });

            // Reverse the old answer author's reputation
            await User.findByIdAndUpdate(oldAnswer.author, { $inc: { reputation: -answerAuthorRep } }, { session });
            // Reverse the question author's curating bonus for the old accept
            await User.findByIdAndUpdate(question.author, { $inc: { reputation: -questionAuthorRep } }, { session });
          }
        }

        // Accept the new answer
        await Answer.findByIdAndUpdate(answerId, { $set: { isAccepted: true } }, { session });
        await Question.findByIdAndUpdate(questionId, { $set: { acceptedAnswer: answer._id } }, { session });

        // Award reputation
        await User.findByIdAndUpdate(answer.author, { $inc: { reputation: answerAuthorRep } }, { session });
        await User.findByIdAndUpdate(question.author, { $inc: { reputation: questionAuthorRep } }, { session });

        accepted = true;
      }

      await session.commitTransaction();
      return { accepted, answerId: answer._id };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },
};

export default AnswerRepository;
