import dbConnect from "@/lib/mongodb";
import Question from "@/app/models/question";
import User from "@/app/models/user";

/**
 * QuestionRepository — data-access layer for questions.
 * Keeps Mongoose queries out of route handlers so logic stays testable and reusable.
 */
const QuestionRepository = {
  /**
   * Create a new question.
   * @param {{ title: string, body: string, tags: string[], author: string, media?: Array }} data
   * @returns {Promise<import("mongoose").Document>}
   */
  async create(data) {
    await dbConnect();
    const question = await Question.create(data);
    return question;
  },

  /**
   * Find a question by its ID and populate the author.
   */
  async findById(id) {
    await dbConnect();
    return Question.findById(id).populate("author", "username displayName profilePic reputation");
  },

  /**
   * Find a question by its slug and populate the author.
   */
  async findBySlug(slug) {
    await dbConnect();
    return Question.findOne({ slug }).populate("author", "username displayName profilePic reputation");
  },

  /**
   * Paginated list of questions, newest first.
   * @param {{ page?: number, limit?: number, tag?: string, author?: string, sort?: string }} opts
   */
  async list({ page = 1, limit = 20, tag, author, sort = "newest" } = {}) {
    await dbConnect();

    const filter = {};
    if (tag) filter.tags = tag;
    if (author) filter.author = author;

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      votes: { voteScore: -1, createdAt: -1 },
      unanswered: { answerCount: 0, createdAt: -1 },
    };

    const sortOrder = sortMap[sort] || sortMap.newest;

    // If the sort is "unanswered", we add a filter rather than a sort key
    if (sort === "unanswered") {
      filter.answerCount = 0;
      delete sortOrder.answerCount;
    }

    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .populate("author", "username displayName profilePic reputation")
        .lean(),
      Question.countDocuments(filter),
    ]);

    return {
      questions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Increment the view count for a question.
   */
  async incrementViews(id) {
    await dbConnect();
    return Question.findByIdAndUpdate(id, { $inc: { views: 1 } });
  },

  /**
   * Update answerCount for a question.
   */
  async updateAnswerCount(questionId, delta = 1) {
    await dbConnect();
    return Question.findByIdAndUpdate(questionId, { $inc: { answerCount: delta } });
  },
};

export default QuestionRepository;
