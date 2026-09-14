/**
 * Client-side Pusher instance (singleton).
 */
import PusherClient from "pusher-js";

let pusherClientInstance = null;

export function getPusherClient() {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        channelAuthorization: {
          endpoint: "/api/pusher/auth",
          transport: "ajax",
        },
      }
    );
  }
  return pusherClientInstance;
}

export default getPusherClient;
