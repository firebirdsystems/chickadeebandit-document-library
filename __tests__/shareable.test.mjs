import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { describe, it, expect } from "vitest";
import { GOVERNING_DOC_TYPES, MEETING_DOC_TYPES, canShareDocument } from "../src/logic.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(__dirname, "../manifest.json"), "utf-8"));
const page = readFileSync(join(__dirname, "../src/index.html"), "utf-8");

const item = manifest.shareable?.document;

/**
 * A share link is an anonymous read that skips row policies. A document here is
 * already the association's published record, so the page may show it, but only
 * as it stands now: superseded versions (and their change notes) are board
 * history, and who uploaded what is member data.
 */
describe("shareable.document", () => {
  it("anchors on documents by id and title", () => {
    expect(Object.keys(manifest.shareable)).toEqual(["document"]);
    expect(item.table).toBe("documents");
    expect(item.id_column ?? "id").toBe("id");
    expect(item.title_column).toBe("title");
  });

  it("projects the type, description, meeting date and last update", () => {
    expect(item.columns.map((c) => c.column)).toEqual(["doc_type", "description", "meeting_date", "updated_at"]);
  });

  it("labels every doc_type the app can store, from one list", () => {
    const governing = GOVERNING_DOC_TYPES.map((t) => t.id);
    const meeting = MEETING_DOC_TYPES.map((t) => t.id);
    // docTypeLabel resolves per category; the page has no category, so the two
    // lists must not share an id or one label would shadow the other.
    expect(governing.filter((id) => meeting.includes(id))).toEqual([]);
    const expected = Object.fromEntries(
      [...GOVERNING_DOC_TYPES, ...MEETING_DOC_TYPES].map((t) => [t.id, t.label]),
    );
    const docType = item.columns.find((c) => c.column === "doc_type");
    expect(docType.value_labels).toEqual(expected);
  });

  // max_items 1 is what keeps superseded versions undownloadable: the hub only
  // serves files attached to entries the page renders, so an older version's
  // file_id is never reachable through the link.
  it("offers the current version, and only that one, as a download", () => {
    expect(item.feed.table).toBe("document_versions");
    expect(item.feed.fk_column).toBe("document_id");
    expect(item.feed.files_column).toBe("file_id");
    expect(item.feed.order_column).toBe("version_number");
    expect(item.feed.order).toBe("newest");
    expect(item.feed.max_items).toBe(1);
    expect(item.feed.columns.map((c) => c.column)).toEqual(["version_number", "uploaded_at", "change_note"]);
  });

  // The admission check wants the order column declared plaintext even though
  // this app runs with db_encryption "off".
  it("declares the order column plaintext", () => {
    expect(manifest.db_plaintext_columns).toContain("version_number");
  });

  it("never names who created or uploaded anything", () => {
    const text = JSON.stringify(item);
    expect(text).not.toContain("created_by");
    expect(text).not.toContain("uploaded_by");
    expect(item.aggregates).toBeUndefined();
  });

  // Enforced on READ only: the mint checks the row exists, not this, which is
  // why the UI gates the button on canShareDocument as well.
  it("only renders documents everyone here can read", () => {
    expect(item.visible_where).toEqual({ column: "visibility", values: ["everyone"] });
  });

  // No uploader gate for the hub to apply to the link's download. Adding a
  // file_acls.read here would hide any version uploaded by someone other than
  // the member who created the link.
  it("declares no file read ACL", () => {
    expect(manifest.file_acls?.read).toBeUndefined();
  });

  it("is read-only and is the item type the page mints", () => {
    expect(item.submit).toBeUndefined();
    expect(page).toMatch(/itemType:\s*"document"/);
  });

  it("tells the sharer that earlier versions stay here", () => {
    const scope = page.match(/scopeHtml:\s*\(\)\s*=>\s*"([^"]+)"/)?.[1] ?? "";
    expect(scope).toMatch(/current version/);
    expect(scope).toMatch(/Earlier versions and their history stay here/);
  });
});

describe("canShareDocument", () => {
  const doc = { id: "d1", visibility: "everyone", current_version: 2 };

  it("allows a document everyone can read that has a version", () => {
    expect(canShareDocument(doc)).toBe(true);
    expect(canShareDocument({ ...doc, current_version: 1 })).toBe(true);
  });

  it("refuses any other stored visibility, since the mint would not", () => {
    expect(canShareDocument({ ...doc, visibility: "adults" })).toBe(false);
    expect(canShareDocument({ ...doc, visibility: "private" })).toBe(false);
    expect(canShareDocument({ ...doc, visibility: undefined })).toBe(false);
  });

  it("refuses a document with nothing to download yet", () => {
    expect(canShareDocument({ ...doc, current_version: 0 })).toBe(false);
    expect(canShareDocument({ ...doc, current_version: null })).toBe(false);
  });

  it("refuses a missing document", () => {
    expect(canShareDocument(null)).toBe(false);
    expect(canShareDocument(undefined)).toBe(false);
  });

  it("gates the page's Share button", () => {
    expect(page).toMatch(/CAN_SHARE && canShareDocument\(d\)/);
    expect(page).toContain('data-testid="document-share"');
  });
});
