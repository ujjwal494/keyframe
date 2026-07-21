import dbConnect from "@/lib/mongodb";
import Answer from "@/app/models/answer";
import Question from "@/app/models/question";
import User from "@/app/models/user";

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
};

export default AnswerRepository;
