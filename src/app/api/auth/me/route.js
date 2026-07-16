import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/app/models/user";
import { authenticate } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Protected route — reads JWT from the HTTP-Only cookie.
 * Returns the current logged-in user's data.
 */
export async function GET() {
  const authResult = await authenticate();

  if (authResult.error) {
    return authResult.error;
  }

  const { id } = authResult.user;

  try {
    await dbConnect();

    const user = await User.findById(id).select("-passwordHash");

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
        reputation: user.reputation,
      },
    });

  } catch (error) {
    console.error("Auth/me error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
