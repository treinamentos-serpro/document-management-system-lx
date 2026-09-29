const { randomUUID } = require('node:crypto');
const documentsRepository = require('../repositories/documents.repository');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function httpError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function sanitizeOriginalName(name) {
  const basename = String(name || '')
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim();

  return basename || 'document';
}

async function uploadDocument(file, owner) {
  if (!file) throw httpError(400, 'FILE_REQUIRED', 'Envie um arquivo no campo "file".');

  const document = {
    id: randomUUID(),
    originalName: sanitizeOriginalName(file.originalname),
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storedName: file.filename,
    mimeType: file.mimetype || 'application/octet-stream',
  };

  try {
    return await documentsRepository.add(document);
  } catch (error) {
    await documentsRepository.removeFile(file.filename);
    throw error;
  }
}

function listDocuments(owner) {
  return documentsRepository.findByOwner(owner);
}

async function getDocumentForDownload(id, owner) {
  if (!UUID_PATTERN.test(id)) {
    throw httpError(400, 'INVALID_DOCUMENT_ID', 'O identificador do documento é inválido.');
  }

  const document = documentsRepository.findOwnedById(id, owner);
  if (!document) throw httpError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');

  const localFile = await documentsRepository.getLocalFile(document);
  if (!localFile) throw httpError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');

  return { ...localFile, originalName: document.originalName };
}

module.exports = { uploadDocument, listDocuments, getDocumentForDownload, httpError };