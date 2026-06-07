import { expect, test } from "vitest";
import {
  isBoard, docTypeLabel, nextVersionNumber,
  groupGoverningDocs, sortMeetingDocs,
} from "../src/logic.js";

// ── isBoard ────────────────────────────────────────────────────────────────────

test("all adults are board when no group configured", () => {
  expect(isBoard({ id: "a1", role: "adult" }, [], "")).toBe(true);
});

test("children are never board", () => {
  expect(isBoard({ id: "c1", role: "child" }, [], "")).toBe(false);
});

test("null member is not board", () => {
  expect(isBoard(null, [], "")).toBe(false);
});

test("adult in board group is board", () => {
  const groups = [{ id: "g1", memberIds: ["a1", "a2"] }];
  expect(isBoard({ id: "a1", role: "adult" }, groups, "g1")).toBe(true);
});

test("adult not in board group is not board", () => {
  const groups = [{ id: "g1", memberIds: ["a1", "a2"] }];
  expect(isBoard({ id: "a3", role: "adult" }, groups, "g1")).toBe(false);
});

test("falls back to all adults when configured group no longer exists", () => {
  expect(isBoard({ id: "a1", role: "adult" }, [], "deleted-group-id")).toBe(true);
});

// ── docTypeLabel ───────────────────────────────────────────────────────────────

test("resolves governing doc type labels", () => {
  expect(docTypeLabel("governing", "ccr")).toBe("CC&Rs");
  expect(docTypeLabel("governing", "bylaws")).toBe("Bylaws");
});

test("resolves meeting doc type labels", () => {
  expect(docTypeLabel("meeting", "agenda")).toBe("Agenda");
  expect(docTypeLabel("meeting", "minutes")).toBe("Minutes");
});

test("falls back to Other for unknown doc type", () => {
  expect(docTypeLabel("governing", "made-up")).toBe("Other");
});

// ── nextVersionNumber ──────────────────────────────────────────────────────────

test("increments the current version", () => {
  expect(nextVersionNumber(1)).toBe(2);
  expect(nextVersionNumber(4)).toBe(5);
});

test("starts at 1 when there is no current version", () => {
  expect(nextVersionNumber(undefined)).toBe(1);
  expect(nextVersionNumber(null)).toBe(1);
});

// ── groupGoverningDocs ─────────────────────────────────────────────────────────

test("groups governing docs by type in canonical order, alphabetized within group", () => {
  const docs = [
    { id: "1", doc_type: "rules", title: "Pool Rules" },
    { id: "2", doc_type: "ccr", title: "Zebra CC&R Amendment" },
    { id: "3", doc_type: "ccr", title: "Original CC&Rs" },
    { id: "4", doc_type: "bylaws", title: "Bylaws 2024" },
  ];
  const groups = groupGoverningDocs(docs);
  expect(groups.map(g => g.type.id)).toEqual(["ccr", "bylaws", "rules"]);
  expect(groups[0].items.map(d => d.title)).toEqual(["Original CC&Rs", "Zebra CC&R Amendment"]);
});

test("omits doc types with no documents", () => {
  const groups = groupGoverningDocs([{ id: "1", doc_type: "bylaws", title: "Bylaws" }]);
  expect(groups).toHaveLength(1);
  expect(groups[0].type.id).toBe("bylaws");
});

// ── sortMeetingDocs ────────────────────────────────────────────────────────────

test("sorts meeting archive newest-first by meeting_date", () => {
  const docs = [
    { id: "1", meeting_date: "2026-01-15" },
    { id: "2", meeting_date: "2026-03-01" },
    { id: "3", meeting_date: "2026-02-10" },
  ];
  expect(sortMeetingDocs(docs).map(d => d.id)).toEqual(["2", "3", "1"]);
});
