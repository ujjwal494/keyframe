import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/app/models/user";
import Question from "@/app/models/question";
import Answer from "@/app/models/answer";

/**
 * GET /api/users/[username]
 * Returns public profile data for a user (no passwordHash).
 */
export async function GET(request, props) {
  try {
    const params = await props.params;
    const { username } = params;

    await dbConnect();

    const user = await User.findOne({ username })
      .select("-passwordHash -providerId")
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Count questions and answers by this user
    const [questionCount, answerCount] = await Promise.all([
      Question.countDocuments({ author: user._id }),
      Answer.countDocuments({ author: user._id }),
    ]);

    // Fetch recent questions (last 5)
    const recentQuestions = await Question.find({ author: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title slug voteScore answerCount createdAt tags")
      .lean();

    // Fetch recent answers (last 5) with their parent question title
    const recentAnswers = await Answer.find({ author: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("body voteScore isAccepted question createdAt")
      .populate("question", "title slug")
      .lean();

    return NextResponse.json({
      user: {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        profilePic: user.profilePic,
        bio: user.bio || "",
        skillTags: user.skillTags || [],
        reputation: user.reputation || 1,
        badges: user.badges || [],
        createdAt: user.createdAt,
      },
      stats: {
        questionCount,
        answerCount,
        reputation: user.reputation || 1,
      },
      recentQuestions,
      recentAnswers,
    });
  } catch (error) {
    console.error("User profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
