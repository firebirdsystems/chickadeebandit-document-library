-- Meeting documents (agendas, minutes), newest meeting first, each joined to
-- its current version's file metadata. Mirrors sortMeetingDocs() in
-- src/logic.js, which sorts by meeting_date descending.
SELECT
  d.id,
  d.doc_type,
  d.title,
  d.description,
  d.meeting_date,
  d.visibility,
  d.current_version,
  v.filename,
  v.mime_type,
  v.size_bytes,
  v.uploaded_at
FROM app_document_library__documents d
LEFT JOIN app_document_library__document_versions v
  ON v.document_id = d.id AND v.version_number = d.current_version
WHERE d.category = 'meeting'
ORDER BY d.meeting_date DESC
LIMIT 200
