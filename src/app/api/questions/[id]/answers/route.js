import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AnswerRepository from "@/lib/answerRepository";
import QuestionRepository from "@/lib/questionRepository";

/**
 * GET /api/questions/[id]/answers
 * Fetches all answers for a specific question.
 */
export async function GET(request, props) {
  try {
    const params = await props.params;
    const questionId = params.id;

    // First, resolve the question (could be a slug or ObjectId)
    const question = await resolveQuestion(questionId);
    if (!question) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const data = await AnswerRepository.listByQuestion(question._id, { page, limit });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch answers error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/questions/[id]/answers
 * Creates a new answer on a question. Requires authentication.
 */
export async function POST(request, props) {
  try {
    const params = await props.params;
    const questionId = params.id;

    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to post an answer." },
        { status: 401 }
      );
    }

    // 2. Resolve the question
    const question = await resolveQuestion(questionId);
    if (!question) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    // 3. Parse & validate input
    const { body, media } = await request.json();

    if (!body?.trim()) {
      return NextResponse.json(
        { error: "Answer body is required." },
        { status: 400 }
      );
    }

    if (body.trim().length < 10) {
      return NextResponse.json(
        { error: "Answer must be at least 10 characters." },
        { status: 400 }
      );
    }

    // Validate media (optional)
    const cleanMedia = (media || []).filter(
      (m) => m.url && ["image", "video"].includes(m.type)
    );

    // 4. Create answer via repository
    const answer = await AnswerRepository.create({
      body: body.trim(),
      author: session.user.id,
      question: question._id,
      media: cleanMedia,
    });

    // 5. Return created answer
    return NextResponse.json(
      {
        message: "Answer posted successfully.",
        answer: {
          id: answer._id,
          body: answer.body,
          createdAt: answer.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create answer error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { error: messages.join(" ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Helper: Resolve a question identifier (ObjectId or slug) to a question document.
 */
import mongoose from "mongoose";

async function resolveQuestion(identifier) {
  let question = null;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    question = await QuestionRepository.findById(identifier);
  }

  if (!question) {
    question = await QuestionRepository.findBySlug(identifier);
  }

  return question;
}
