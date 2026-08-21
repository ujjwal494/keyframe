import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AnswerRepository from "@/lib/answerRepository";
import QuestionRepository from "@/lib/questionRepository";
import mongoose from "mongoose";

/**
 * Helper: Resolve a question identifier (ObjectId or slug) to a raw question ID.
 * Returns the ObjectId string, or null if not found.
 */
async function resolveQuestionId(identifier) {
  let question = null;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    question = await QuestionRepository.findById(identifier);
  }

  if (!question) {
    question = await QuestionRepository.findBySlug(identifier);
  }

  return question?._id?.toString() || null;
}

/**
 * Accepts or un-accepts an answer on a question.
 * Only the question author may call this endpoint.
 */
export async function PATCH(request, props) {
  try {
    const params = await props.params;
    const questionIdentifier = params.id;
    const answerId = params.answerId;

    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to accept an answer." },
        { status: 401 }
      );
    }

    // 2. Resolve the question (could be slug or ObjectId)
    const questionId = await resolveQuestionId(questionIdentifier);
    if (!questionId) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    // 3. Validate answerId format
    if (!mongoose.Types.ObjectId.isValid(answerId)) {
      return NextResponse.json(
        { error: "Invalid answer ID." },
        { status: 400 }
      );
    }

    // 4. Delegate to the repository 
    const result = await AnswerRepository.acceptAnswer(questionId, answerId, session.user.id);

    return NextResponse.json({
      message: result.accepted
        ? "Answer accepted successfully."
        : "Answer un-accepted successfully.",
      accepted: result.accepted,
      answerId: result.answerId,
    });
  } catch (error) {
    console.error("Accept answer error:", error);

    // Surface known errors with their status codes
    if (error.statusCode) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
