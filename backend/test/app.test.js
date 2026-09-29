const { test } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');
const fs = require('node:fs/promises');
const path = require('node:path');
const storagePath = path.resolve(__dirname, '../storage');

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('upload, listagem e download ficam restritos ao proprietário', async () => {
  const existingFiles = new Set(await fs.readdir(storagePath));
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const missingUserResponse = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(missingUserResponse.status, 400);
    assert.strictEqual((await missingUserResponse.json()).error.code, 'INVALID_USER_ID');

    const emptyFormData = new FormData();
    const missingFileResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': 'usuario-teste' },
      body: emptyFormData,
    });
    assert.strictEqual(missingFileResponse.status, 400);
    assert.strictEqual((await missingFileResponse.json()).error.code, 'FILE_REQUIRED');

    const formData = new FormData();
    formData.append('file', new Blob(['conteudo do documento']), 'relatorio.txt');
    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': 'usuario-teste' },
      body: formData,
    });

    assert.strictEqual(uploadResponse.status, 201);
    const uploadedDocument = await uploadResponse.json();
    assert.deepStrictEqual(Object.keys(uploadedDocument).sort(), [
      'id', 'originalName', 'owner', 'size', 'uploadedAt',
    ]);
    assert.strictEqual(uploadedDocument.originalName, 'relatorio.txt');
    assert.strictEqual(uploadedDocument.owner, 'usuario-teste');
    assert.strictEqual(uploadedDocument.size, 21);

    const ownerListResponse = await fetch(`${baseUrl}/documents`, {
      headers: { 'X-User-Id': 'usuario-teste' },
    });
    assert.strictEqual(ownerListResponse.status, 200);
    assert.deepStrictEqual(await ownerListResponse.json(), {
      documents: [uploadedDocument],
    });

    const otherUserListResponse = await fetch(`${baseUrl}/documents`, {
      headers: { 'X-User-Id': 'outro-usuario' },
    });
    assert.deepStrictEqual(await otherUserListResponse.json(), { documents: [] });

    const forbiddenDownloadResponse = await fetch(
      `${baseUrl}/documents/${uploadedDocument.id}/download`,
      { headers: { 'X-User-Id': 'outro-usuario' } },
    );
    assert.strictEqual(forbiddenDownloadResponse.status, 404);

    const missingDocumentResponse = await fetch(
      `${baseUrl}/documents/00000000-0000-4000-8000-000000000000/download`,
      { headers: { 'X-User-Id': 'usuario-teste' } },
    );
    assert.strictEqual(missingDocumentResponse.status, 404);

    const downloadResponse = await fetch(
      `${baseUrl}/documents/${uploadedDocument.id}/download`,
      { headers: { 'X-User-Id': 'usuario-teste' } },
    );
    assert.strictEqual(downloadResponse.status, 200);
    assert.strictEqual(await downloadResponse.text(), 'conteudo do documento');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    const newFiles = (await fs.readdir(storagePath)).filter((file) => !existingFiles.has(file));
    await Promise.all(newFiles.map((file) => fs.unlink(path.join(storagePath, file))));
  }
});
