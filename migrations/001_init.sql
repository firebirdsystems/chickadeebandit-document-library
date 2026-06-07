CREATE TABLE IF NOT EXISTS app_settings (
  household_id   UUID NOT NULL DEFAULT current_setting('app.household_id', true)::uuid,
  board_group_id TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (household_id)
);

CREATE TABLE IF NOT EXISTS documents (
  household_id    UUID NOT NULL DEFAULT current_setting('app.household_id', true)::uuid,
  id              TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'governing',
  doc_type        TEXT NOT NULL DEFAULT '',
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  meeting_date    TEXT,
  current_version INTEGER NOT NULL DEFAULT 1,
  created_by      TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  PRIMARY KEY (household_id, id)
);

CREATE TABLE IF NOT EXISTS document_versions (
  household_id   UUID NOT NULL DEFAULT current_setting('app.household_id', true)::uuid,
  id             TEXT NOT NULL,
  document_id    TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  file_id        TEXT NOT NULL,
  filename       TEXT NOT NULL,
  mime_type      TEXT NOT NULL,
  size_bytes     INTEGER NOT NULL,
  change_note    TEXT NOT NULL DEFAULT '',
  uploaded_by    TEXT NOT NULL,
  uploaded_at    TEXT NOT NULL,
  PRIMARY KEY (household_id, id)
);

CREATE INDEX IF NOT EXISTS idx_dl_documents_category
  ON documents (household_id, category);

CREATE INDEX IF NOT EXISTS idx_dl_versions_document
  ON document_versions (household_id, document_id, version_number DESC);
