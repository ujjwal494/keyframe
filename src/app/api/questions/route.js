import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import QuestionRepository from "@/lib/questionRepository";

/**
 * POST /api/questions
 * Creates a new question. Requires an authenticated session.
 *
 * Body: { title: string, body: string, tags: string[], media?: Array }
 */
export async function POST(request) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to ask a question." },
        { status: 401 }
      );
    }

    // 2. Parse & validate input
    const { title, body, tags, media } = await request.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    if (title.trim().length < 10) {
      return NextResponse.json(
        { error: "Title must be at least 10 characters." },
        { status: 400 }
      );
    }

    if (!body?.trim()) {
      return NextResponse.json(
        { error: "Question body is required." },
        { status: 400 }
      );
    }

    if (body.trim().length < 20) {
      return NextResponse.json(
        { error: "Question body must be at least 20 characters." },
        { status: 400 }
      );
    }

    if (!Array.isArray(tags) || tags.length < 1 || tags.length > 5) {
      return NextResponse.json(
        { error: "Please provide between 1 and 5 tags." },
        { status: 400 }
      );
    }

    // Sanitise tags
    const cleanTags = tags
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    if (cleanTags.length === 0) {
      return NextResponse.json(
        { error: "Tags cannot be empty." },
        { status: 400 }
      );
    }

    // Validate media (optional)
    if (media && !Array.isArray(media)) {
      return NextResponse.json(
        { error: "Media must be an array." },
        { status: 400 }
      );
    }

    const cleanMedia = (media || []).filter(
      (m) => m.url && ["image", "video"].includes(m.type)
    );

    // 3. Create question via repository
    const question = await QuestionRepository.create({
      title: title.trim(),
      body: body.trim(),
      tags: cleanTags,
      author: session.user.id,
      media: cleanMedia,
    });

    // 4. Return created question
    return NextResponse.json(
      {
        message: "Question created successfully.",
        question: {
          id: question._id,
          title: question.title,
          slug: question.slug,
          tags: question.tags,
          createdAt: question.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create question error:", error);

    // Surface Mongoose validation errors nicely
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { error: messages.join(" ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Server error: ${error.message || error.toString()}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/questions
 * Fetches a paginated list of questions.
 *
 * Query Params: page, limit, tag, author, sort
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const tag = searchParams.get("tag");
    const author = searchParams.get("author");
    const sort = searchParams.get("sort") || "newest";

    const data = await QuestionRepository.list({ page, limit, tag, author, sort });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch questions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions." },
      { status: 500 }
    );
  }
}
