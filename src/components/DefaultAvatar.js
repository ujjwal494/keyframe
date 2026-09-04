/**
 * DefaultAvatar — renders the first letter of a user's name inside a
 * coloured circle. The gradient is deterministically picked from the name
 * so the same user always gets the same colour.
 *
 * @param {string}  [name]       – user's display name / username (falls back to "?")
 * @param {string}  [className]  – optional extra classes for the outer wrapper
 * @param {number}  [size=32]    – width & height in px
 */

const gradients = [
  "from-indigo-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-fuchsia-600",
];

function pickGradient(name) {
  if (!name) return gradients[0];
  return gradients[name.charCodeAt(0) % gradients.length];
}

// Map size ranges to tailwind-friendly font sizes
function fontSize(size) {
  if (size >= 80) return "text-3xl";
  if (size >= 36) return "text-sm";
  if (size >= 28) return "text-xs";
  return "text-[10px]";
}

export default function DefaultAvatar({ name, className = "", size = 32 }) {
  const letter = (name || "?").charAt(0).toUpperCase();

  return (
    <div
      className={`rounded-full bg-gradient-to-br ${pickGradient(name)} flex items-center justify-center text-white font-bold shrink-0 ${fontSize(size)} ${className}`}
      style={{ width: size, height: size }}
    >
      {letter}
    </div>
  );
}
