// Shared utilities (memberColor, initial, esc, isAdult, formatRelativeDate) live in /hub-sdk.js.
// This file exports document-library-specific logic only.
import { isAdult } from "./shared.js";
export { isAdult };

// ── Board permission ──────────────────────────────────────────────────────────
/**
 * Returns true if the given member may upload, version, and manage documents.
 *
 * This MUST mirror the hub's server-side privileged check for the `documents`
 * row policy (`insert_privileged_only` + `bypass_group_setting`): a member is
 * privileged iff a board group is configured AND that group still exists AND the
 * member belongs to it. There is deliberately NO "all adults" fallback when no
 * group is set — the hub rejects every INSERT in that case
 * (`insert_privileged_only` requires a resolvable group), so showing the upload
 * UI to adults would only produce 403s. An admin must appoint a Board group in
 * settings before anyone can manage documents.
 *
 * @param {object|null} member
 * @param {Array}  groups
 * @param {string|null} boardGroupId
 */
export function isBoard(member, groups, boardGroupId) {
  if (!member || !boardGroupId) return false;
  const g = groups.find(g => g.id === boardGroupId);
  return !!g && g.memberIds.includes(member.id);
}

// ── Document types ────────────────────────────────────────────────────────────

export const GOVERNING_DOC_TYPES = [
  { id: "ccr",           label: "CC&Rs" },
  { id: "bylaws",        label: "Bylaws" },
  { id: "rules",         label: "Rules & Regulations" },
  { id: "architectural", label: "Architectural Guidelines" },
  { id: "other",         label: "Other" },
];

export const MEETING_DOC_TYPES = [
  { id: "agenda",  label: "Agenda" },
  { id: "minutes", label: "Minutes" },
];

export function docTypesFor(category) {
  return category === "meeting" ? MEETING_DOC_TYPES : GOVERNING_DOC_TYPES;
}

export function docTypeLabel(category, docType) {
  return docTypesFor(category).find(t => t.id === docType)?.label ?? "Other";
}

// ── Versioning ────────────────────────────────────────────────────────────────

export function nextVersionNumber(currentVersion) {
  return (currentVersion ?? 0) + 1;
}

// ── File metadata (mirrors docs app's logic.js) ───────────────────────────────

export const ALLOWED_EXTENSIONS = {
  "image/jpeg":        { ext: "jpg",  label: "JPEG",  icon: "🖼️" },
  "image/png":         { ext: "png",  label: "PNG",   icon: "🖼️" },
  "image/heic":        { ext: "heic", label: "HEIC",  icon: "🖼️" },
  "image/heif":        { ext: "heif", label: "HEIF",  icon: "🖼️" },
  "image/webp":        { ext: "webp", label: "WebP",  icon: "🖼️" },
  "image/gif":         { ext: "gif",  label: "GIF",   icon: "🖼️" },
  "application/pdf":   { ext: "pdf",  label: "PDF",   icon: "📄" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                       { ext: "docx", label: "Word",  icon: "📝" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                       { ext: "xlsx", label: "Excel", icon: "📊" },
  "text/plain":        { ext: "txt",  label: "Text",  icon: "📃" },
  "text/markdown":     { ext: "md",   label: "Markdown", icon: "📃" },
};

export function isImage(mimeType) {
  return mimeType?.startsWith("image/") === true;
}

export function isPreviewableImage(mimeType) {
  return isImage(mimeType) && mimeType !== "image/heic" && mimeType !== "image/heif";
}

export function isPdf(mimeType) {
  return mimeType === "application/pdf";
}

export function fileIcon(mimeType) {
  return ALLOWED_EXTENSIONS[mimeType]?.icon ?? "📎";
}

export function formatBytes(bytes) {
  if (bytes < 1024)            return `${bytes} B`;
  if (bytes < 1024 * 1024)     return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function accept() {
  return Object.keys(ALLOWED_EXTENSIONS).join(",");
}

// ── Sorting / grouping ────────────────────────────────────────────────────────

/** Groups governing documents by doc_type, preserving GOVERNING_DOC_TYPES order. */
export function groupGoverningDocs(docs) {
  const byType = new Map();
  for (const d of docs) {
    if (!byType.has(d.doc_type)) byType.set(d.doc_type, []);
    byType.get(d.doc_type).push(d);
  }
  const groups = [];
  for (const t of GOVERNING_DOC_TYPES) {
    const items = byType.get(t.id);
    if (items?.length) groups.push({ type: t, items: items.sort((a, b) => a.title.localeCompare(b.title)) });
  }
  return groups;
}

/** Sorts meeting archive entries newest-first by meeting_date. */
export function sortMeetingDocs(docs) {
  return [...docs].sort((a, b) => (b.meeting_date ?? "").localeCompare(a.meeting_date ?? ""));
}
