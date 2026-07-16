import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/app/models/user";
import { signToken, setTokenCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email." },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    // Create JWT and set it as an HTTP-Only cookie
    const token = signToken({
      id: user._id,
      email: user.email,
      username: user.username,
    });

    const response = NextResponse.json({
      user: {
        id: user._id,
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
      },
    });

    // Attach the cookie to the response
    setTokenCookie(response, token);

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
