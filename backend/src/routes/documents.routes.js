const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const express = require('express');
const multer = require('multer');
const { storageDirectory } = require('../config/storage');
const documentsController = require('../controllers/documents.controller');

const router = express.Router();
const configuredFileSize = process.env.MAX_FILE_SIZE_BYTES;
const maxFileSize = configuredFileSize === undefined
  ? 10 * 1024 * 1024
  : Number(configuredFileSize);

if (!Number.isSafeInteger(maxFileSize) || maxFileSize <= 0) {
  throw new Error('MAX_FILE_SIZE_BYTES deve ser um inteiro positivo.');
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    fs.mkdir(storageDirectory, { recursive: true }, (error) => {
      callback(error, storageDirectory);
    });
  },
  filename: (req, file, callback) => callback(null, randomUUID()),
});

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize, files: 1 },
});

router.post( 
  '/upload',
  documentsController.requireUserId,
  upload.single('file'),
  documentsController.upload,
);
router.get('/documents', documentsController.requireUserId, documentsController.list);
router.get(
  '/documents/:id/download',
  documentsController.requireUserId,
  documentsController.download,
);

module.exports = router;