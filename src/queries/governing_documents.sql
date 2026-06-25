-- Governing documents (CC&Rs, bylaws, rules, architectural guidelines, etc.),
-- each joined to its current version's file metadata. Mirrors
-- groupGoverningDocs() in src/logic.js, grouped/ordered by doc_type.
SELECT
  d.id,
  d.doc_type,
  d.title,
  d.description,
  d.visibility,
  d.current_version,
  d.updated_at,
  v.filename,
  v.mime_type,
  v.size_bytes,
  v.uploaded_at
FROM app_document_library__documents d
LEFT JOIN app_document_library__document_versions v
  ON v.document_id = d.id AND v.version_number = d.current_version
WHERE d.category = 'governing'
ORDER BY d.doc_type, d.title
LIMIT 200
