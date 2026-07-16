import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "keyframe_token";

/**
 * Signs a JWT token with the user's data.
 * The token expires in 7 days.
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * Throws an error if the token is invalid or expired.
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Sets the JWT as an HTTP-Only cookie on the response.
 * 
 * - HttpOnly: JavaScript cannot read this cookie (prevents XSS theft)
 * - Secure: only sent over HTTPS (disabled in dev for localhost)
 * - SameSite=Lax: prevents CSRF while allowing normal navigation
 * - MaxAge: 7 days in seconds (matches token expiry)
 * - Path=/: cookie is sent with every request to the domain
 */
export function setTokenCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return response;
}

/**
 * Clears the JWT cookie (used for logout).
 */
export function clearTokenCookie(response) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // expires immediately
    path: "/",
  });
  return response;
}

/**
 * Auth Middleware — extracts JWT from the HTTP-Only cookie and verifies it.
 * 
 * Usage in any protected API route:
 *   const authResult = await authenticate();
 *   if (authResult.error) return authResult.error;
 *   const user = authResult.user;
 */
export async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return {
      error: new Response(
        JSON.stringify({ error: "Authentication required. Please log in." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  try {
    const decoded = verifyToken(token);
    return { user: decoded };
  } catch (err) {
    const message = err.name === "TokenExpiredError"
      ? "Session expired. Please log in again."
      : "Invalid token. Please log in again.";

    return {
      error: new Response(
        JSON.stringify({ error: message }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    };
  }
}
