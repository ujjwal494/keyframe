import { NextResponse } from "next/server";
import { clearTokenCookie } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * Clears the HTTP-Only JWT cookie, effectively logging the user out.
 */
export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully." });
  clearTokenCookie(response);
  return response;
}
