CREATE TABLE IF NOT EXISTS app_document_library__app_settings (
  singleton_key  TEXT NOT NULL DEFAULT 'settings' PRIMARY KEY CHECK (singleton_key = 'settings'),
  board_group_id TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS app_document_library__documents (
  id              TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'governing',
  doc_type        TEXT NOT NULL DEFAULT '',
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  meeting_date    TEXT,
  current_version INTEGER NOT NULL DEFAULT 1,
  visibility      TEXT NOT NULL DEFAULT 'everyone',
  created_by      TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS app_document_library__document_versions (
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
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_dl_documents_category
  ON app_document_library__documents (category);

CREATE INDEX IF NOT EXISTS idx_dl_versions_document
  ON app_document_library__document_versions (document_id, version_number DESC);
