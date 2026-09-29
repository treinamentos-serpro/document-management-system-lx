const documentsService = require('../services/documents.service');

function requireUserId(req, res, next) {
  const owner = req.get('X-User-Id');

  if (!owner || !owner.trim()) {
    return next(documentsService.httpError(
      400,
      'INVALID_USER_ID', 
      'O cabeçalho X-User-Id é obrigatório.',
    ));
  }

  req.userId = owner.trim();
  next();
}

async function upload(req, res) {
  const document = await documentsService.uploadDocument(req.file, req.userId);
  res.status(201).json(document);
}

function list(req, res) {
  res.status(200).json({ documents: documentsService.listDocuments(req.userId) });
}

async function download(req, res) {
  const file = await documentsService.getDocumentForDownload(req.params.id, req.userId);
  res.type(file.mimeType).download(file.filePath, file.originalName);
}

module.exports = { requireUserId, upload, list, download };