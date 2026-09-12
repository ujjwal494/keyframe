
import { NextResponse } from "next/server";
import { getPusherServer } from "@/lib/pusher";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = body.message || "Hello from the server!";

    const pusher = getPusherServer();

    // Trigger the event — Pusher delivers it to all subscribers
    await pusher.trigger("test-channel", "test-event", {
      message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      detail: "Event triggered on test-channel → test-event",
    });
  } catch (error) {
    console.error("Pusher test error:", error);
    return NextResponse.json(
      { error: "Failed to trigger Pusher event.", detail: error.message },
      { status: 500 }
    );
  }
}
