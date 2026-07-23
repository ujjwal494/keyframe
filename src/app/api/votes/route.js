import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import VoteRepository from "@/lib/voteRepository";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "You must be logged in to vote." }, { status: 401 });
    }

    const body = await request.json();
    const { targetId, targetType, value } = body;

    if (!targetId || !targetType || typeof value !== "number") {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!["Question", "Answer"].includes(targetType)) {
      return NextResponse.json({ error: "Invalid target type." }, { status: 400 });
    }

    if (![1, -1].includes(value)) {
      return NextResponse.json({ error: "Invalid vote value." }, { status: 400 });
    }

    const result = await VoteRepository.castVote({
      userId: session.user.id,
      targetId,
      targetType,
      value,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Vote API Error:", error);
    
    if (error.message.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "An error occurred while casting your vote." },
      { status: 500 }
    );
  }
}
