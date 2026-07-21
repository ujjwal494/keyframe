import { NextResponse } from "next/server";
import QuestionRepository from "@/lib/questionRepository";
import mongoose from "mongoose";

/**
 * GET /api/questions/[id]
 * Fetches a single question by its MongoDB ObjectId or its URL slug.
 */
export async function GET(request, props) {
  try {
    const params = await props.params;
    const identifier = params.id; // Could be an ObjectId or a slug
    let question = null;

    // 1. Determine lookup method
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      // It's a valid 24-character hex string, try finding by ID first
      question = await QuestionRepository.findById(identifier);
    } 
    
    // If not found by ID (or it wasn't a valid ID in the first place), try finding by slug
    if (!question) {
      question = await QuestionRepository.findBySlug(identifier);
    }

    // 2. Handle 404
    if (!question) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    // 3. Increment views asynchronously (don't await it to avoid slowing down the response)
    QuestionRepository.incrementViews(question._id).catch(err => {
      console.error("Failed to increment views for question:", question._id, err);
    });

    // 4. Return the question
    return NextResponse.json(question);

  } catch (error) {
    console.error("Fetch single question error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
