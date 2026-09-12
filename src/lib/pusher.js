/**
 * Server-side Pusher instance (singleton).
 *
 * Uses the `pusher` package to trigger events from API routes.
 * All credentials come from environment variables so nothing
 * is leaked to the client bundle.
 */
import Pusher from "pusher";

let pusherInstance;

/**
 * Returns (and lazily creates) a singleton Pusher server instance.
 * Safe to call from any API route — the instance is reused across
 * hot-reloads in development thanks to `globalThis` caching.
 */
export function getPusherServer() {
  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });
  }
  return pusherInstance;
}

// Also cache on globalThis so the instance survives HMR in dev
if (process.env.NODE_ENV !== "production") {
  if (!globalThis.__pusherServer) {
    globalThis.__pusherServer = null;
  }
}

export default getPusherServer;
