import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/app/models/user";

export async function POST(request) {
  try {
    await dbConnect();

    const { displayName, username, email, password } = await request.json();

    if (!displayName?.trim() || !username?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const existingUsername = await User.findOne({ 
      username: { $regex: new RegExp(`^${username.trim()}$`, "i") } 
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken." },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      displayName: displayName.trim(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      profilePic: "",
      bio: "",
      skillTags: [],
      reputation: 1,
      badges: [],
      provider: "credentials",
    });

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
