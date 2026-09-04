import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Vote from "@/app/models/vote";
import Answer from "@/app/models/answer";
import QuestionRepository from "@/lib/questionRepository";
import mongoose from "mongoose";

/**
 * GET /api/questions/[id]/user-votes
 * Returns the authenticated user's votes on all answers for this question.
 * Response: { answerVotes: { [answerId]: 1 | -1 } }
 */
export async function GET(request, props) {
  try {
    const params = await props.params;
    const identifier = params.id;

    // 1. Authenticate — unauthenticated users get an empty map
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ answerVotes: {} });
    }

    await dbConnect();

    // 2. Resolve question (could be slug or ObjectId)
    let question = null;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      question = await QuestionRepository.findById(identifier);
    }
    if (!question) {
      question = await QuestionRepository.findBySlug(identifier);
    }
    if (!question) {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }

    // 3. Get all answer IDs for this question
    const answerIds = await Answer.find({ question: question._id })
      .select("_id")
      .lean();

    if (answerIds.length === 0) {
      return NextResponse.json({ answerVotes: {} });
    }

    // 4. Fetch the user's votes on those answers
    const votes = await Vote.find({
      user: session.user.id,
      targetType: "Answer",
      targetId: { $in: answerIds.map((a) => a._id) },
    })
      .select("targetId value")
      .lean();

    // 5. Build the map
    const answerVotes = {};
    for (const v of votes) {
      answerVotes[v.targetId.toString()] = v.value;
    }

    return NextResponse.json({ answerVotes });
  } catch (error) {
    console.error("User-votes API error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
