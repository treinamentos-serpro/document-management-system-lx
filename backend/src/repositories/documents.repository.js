const fs = require('node:fs/promises');
const path = require('node:path');
const { storageDirectory } = require('../config/storage');

const documents = new Map();

function toPublicDocument(document) {
  const { id, originalName, size, uploadedAt, owner } = document;
  return { id, originalName, size, uploadedAt, owner };
}

async function add(document) {
  documents.set(document.id, document);
  return toPublicDocument(document); 
}

function findByOwner(owner) {
  return [...documents.values()]
    .filter((document) => document.owner === owner)
    .sort((first, second) => second.uploadedAt.localeCompare(first.uploadedAt))
    .map(toPublicDocument);
}

function findOwnedById(id, owner) {
  const document = documents.get(id);
  return document && document.owner === owner ? document : null;
}

function getStoragePath(storedName) {
  if (typeof storedName !== 'string' || !storedName || path.basename(storedName) !== storedName) {
    const error = new Error('Nome de arquivo armazenado inválido.');
    error.code = 'INVALID_STORED_NAME';
    throw error;
  }

  const filePath = path.resolve(storageDirectory, storedName);
  const relativePath = path.relative(storageDirectory, filePath);
  if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
    const error = new Error('Nome de arquivo armazenado inválido.');
    error.code = 'INVALID_STORED_NAME';
    throw error;
  }

  return filePath;
}

async function getLocalFile(document) {
  const filePath = getStoragePath(document.storedName);

  try {
    await fs.access(filePath);
    return { filePath, mimeType: document.mimeType };
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function removeFile(storedName) {
  try {
    await fs.unlink(getStoragePath(storedName));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

module.exports = { add, findByOwner, findOwnedById, getLocalFile, removeFile };