// ============================================================
// ClassBoard — shared utilities
// ============================================================

function showToast(message, type = "success") {
  let stack = document.getElementById("toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toast-stack";
    document.body.appendChild(stack);
  }
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(val < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const steps = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [label, secs] of steps) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val} ${label}${val > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

// Extension → { icon, color }
const FILE_TYPE_MAP = {
  pdf: { icon: "📕", color: "#f87171" },
  ppt: { icon: "📙", color: "#fb923c" },
  pptx: { icon: "📙", color: "#fb923c" },
  doc: { icon: "📘", color: "#60a5fa" },
  docx: { icon: "📘", color: "#60a5fa" },
  txt: { icon: "📄", color: "#94a3b8" },
  png: { icon: "🖼️", color: "#34d399" },
  jpg: { icon: "🖼️", color: "#34d399" },
  jpeg: { icon: "🖼️", color: "#34d399" },
  zip: { icon: "🗜️", color: "#a78bfa" },
  rar: { icon: "🗜️", color: "#a78bfa" },
  mp4: { icon: "🎬", color: "#f472b6" },
  mp3: { icon: "🎵", color: "#f472b6" },
  java: { icon: "💻", color: "#22d3ee" },
  py: { icon: "💻", color: "#22d3ee" },
  html: { icon: "💻", color: "#22d3ee" },
  css: { icon: "💻", color: "#22d3ee" },
  js: { icon: "💻", color: "#22d3ee" },
};

function fileTypeMeta(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  return FILE_TYPE_MAP[ext] || { icon: "📁", color: "#94a3b8" };
}

// Consistent accent color per subject name (hash → hue)
function subjectColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

const SUBJECT_ICONS = {
  physics: "⚛️", chemistry: "🧪", mathematics: "📐", math: "📐",
  english: "📖", "computer science": "💻", biology: "🧬",
};

function subjectIcon(name) {
  return SUBJECT_ICONS[name.toLowerCase()] || "📚";
}

function qs(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
