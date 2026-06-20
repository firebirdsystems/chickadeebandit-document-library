-- Move board_group_id into a key/value `settings` table.
--
-- The hub's `bypass_group_setting` lookup reads the privileged-group id with a
-- fixed shape: `SELECT value FROM <settings_table> WHERE key = <settings_key>`.
-- The original singleton `app_settings (singleton_key, board_group_id)` table
-- did not match that shape, so the board bypass never resolved. This migrates
-- to the conventional key/value `settings` table (see violation-tracking).
--
-- The copied value may be ciphertext ("v1:…") depending on how the old row was
-- written; that is fine — the hub decrypts it on lookup, and the app's own
-- reads decrypt it on the way out.
--
-- The old `app_settings` table is left in place (migrations may not drop
-- tables); it is no longer read or written, and keeps its adult_only policy.

CREATE TABLE IF NOT EXISTS app_document_library__settings (
  key   TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

INSERT OR IGNORE INTO app_document_library__settings (key, value)
SELECT 'board_group_id', board_group_id
  FROM app_document_library__app_settings
 WHERE board_group_id <> '';
