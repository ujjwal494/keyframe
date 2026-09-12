"use client";

import { useEffect, useState, useRef } from "react";
import getPusherClient from "@/lib/pusherClient";

export default function PusherTestPage() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("connecting");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const logEndRef = useRef(null);

  // Auto-scroll log to bottom when new events arrive
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  // Subscribe on mount, clean up on unmount
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe("test-channel");

    channel.bind("pusher:subscription_succeeded", () => {
      setStatus("connected");
      setEvents((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "system",
          text: "✅ Subscribed to test-channel",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    });

    channel.bind("pusher:subscription_error", (err) => {
      setStatus("error");
      setEvents((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "error",
          text: `Subscription error: ${JSON.stringify(err)}`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    });

    channel.bind("test-event", (data) => {
      setEvents((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "event",
          text: data.message,
          timestamp: data.timestamp,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  // Fire a test event via the API
  async function triggerEvent() {
    setSending(true);
    try {
      const res = await fetch("/api/pusher-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
    } catch (err) {
      setEvents((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "error",
          text: `API error: ${err.message}`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  const statusColor =
    status === "connected"
      ? "#22c55e"
      : status === "error"
        ? "#ef4444"
        : "#eab308";

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>⚡ Pusher Real-Time Test</h1>
          <span
            style={{
              ...styles.badge,
              backgroundColor: statusColor + "22",
              color: statusColor,
              borderColor: statusColor + "44",
            }}
          >
            <span
              style={{
                ...styles.dot,
                backgroundColor: statusColor,
              }}
            />
            {status}
          </span>
        </div>

        <p style={styles.subtitle}>
          Subscribe to <code style={styles.code}>test-channel</code> →{" "}
          <code style={styles.code}>test-event</code> and trigger events from
          the server.
        </p>

        {/* Trigger controls */}
        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Custom message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && triggerEvent()}
            style={styles.input}
          />
          <button
            onClick={triggerEvent}
            disabled={sending}
            style={{
              ...styles.button,
              opacity: sending ? 0.6 : 1,
            }}
          >
            {sending ? "Sending…" : "🚀 Trigger Event"}
          </button>
        </div>

        {/* Event log */}
        <div style={styles.log}>
          {events.length === 0 ? (
            <p style={styles.empty}>
              Waiting for events… Click the button above or open this page in
              two tabs!
            </p>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                style={{
                  ...styles.logEntry,
                  borderLeftColor:
                    evt.type === "event"
                      ? "#6366f1"
                      : evt.type === "error"
                        ? "#ef4444"
                        : "#22c55e",
                }}
              >
                <span style={styles.logTime}>{evt.time}</span>
                <span style={styles.logText}>{evt.text}</span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>

        {/* Clear button */}
        {events.length > 0 && (
          <button onClick={() => setEvents([])} style={styles.clearBtn}>
            Clear log
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Inline styles (self-contained test page) ---------- */
const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    padding: "2rem",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "640px",
    background: "rgba(30, 27, 75, 0.5)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    borderRadius: "16px",
    padding: "2rem",
    boxShadow:
      "0 0 40px rgba(99, 102, 241, 0.1), 0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#e0e7ff",
    letterSpacing: "-0.02em",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 12px",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: 600,
    border: "1px solid",
    textTransform: "capitalize",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    display: "inline-block",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
    lineHeight: 1.5,
  },
  code: {
    background: "rgba(99, 102, 241, 0.15)",
    color: "#a5b4fc",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "0.85em",
    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
  },
  controls: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: "200px",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    background: "rgba(15, 23, 42, 0.6)",
    color: "#e0e7ff",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "transform 0.15s, box-shadow 0.15s",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
    whiteSpace: "nowrap",
  },
  log: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(99, 102, 241, 0.15)",
    borderRadius: "12px",
    padding: "1rem",
    maxHeight: "320px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  empty: {
    color: "#64748b",
    fontSize: "0.85rem",
    textAlign: "center",
    margin: "2rem 0",
    fontStyle: "italic",
  },
  logEntry: {
    padding: "8px 12px",
    borderLeft: "3px solid",
    borderRadius: "0 8px 8px 0",
    background: "rgba(99, 102, 241, 0.05)",
    display: "flex",
    gap: "0.75rem",
    alignItems: "baseline",
  },
  logTime: {
    color: "#64748b",
    fontSize: "0.75rem",
    fontFamily: "monospace",
    whiteSpace: "nowrap",
  },
  logText: {
    color: "#e0e7ff",
    fontSize: "0.85rem",
    wordBreak: "break-word",
  },
  clearBtn: {
    marginTop: "1rem",
    padding: "6px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    background: "transparent",
    color: "#94a3b8",
    fontSize: "0.8rem",
    cursor: "pointer",
    transition: "color 0.2s",
  },
};
