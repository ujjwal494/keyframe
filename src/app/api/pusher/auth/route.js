/**
 * POST /api/pusher/auth
 *
 * Authorizes a Pusher private-channel subscription.
 *
 * Flow:
 *  1. Verify the caller has a valid NextAuth session.
 *  2. Parse the `socket_id` and `channel_name` from the request body
 *     (Pusher sends these as URL-encoded form data).
 *  3. Ensure the requested channel matches `private-user-<session.user.id>`.
 *  4. Return the Pusher auth signature so the client can complete the
 *     subscription handshake.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPusherServer } from "@/lib/pusher";

export async function POST(request) {
  // 1. Authenticate — reject unauthenticated callers immediately
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Parse the form-encoded body Pusher sends
  const body = await request.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channelName = params.get("channel_name");

  if (!socketId || !channelName) {
    return new Response(
      JSON.stringify({ error: "Missing socket_id or channel_name" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. Authorize — a user may only subscribe to their OWN private channel
  const expectedChannel = `private-user-${session.user.id}`;

  if (channelName !== expectedChannel) {
    return new Response(
      JSON.stringify({ error: "Forbidden: channel mismatch" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 4. Generate the Pusher auth signature
  const pusher = getPusherServer();
  const authResponse = pusher.authorizeChannel(socketId, channelName);

  return new Response(JSON.stringify(authResponse), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
