const API_BASE = '/api';

async function readError(response) {
  try {
    const payload = await response.json();
    return payload?.error?.message || 'Não foi possível concluir a operação.';
  } catch { 
    return 'Não foi possível concluir a operação.';
  }
}

async function ensureSuccess(response) {
  if (!response.ok) {
    const error = new Error(await readError(response));
    error.status = response.status;
    throw error;
  }
  return response;
}

export async function listDocuments(userId, options = {}) {
  const response = await fetch(`${API_BASE}/documents`, {
    headers: { 'X-User-Id': userId },
    signal: options.signal,
  });
  const payload = await ensureSuccess(response);
  return payload.json();
}

export async function uploadDocument(userId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': userId },
    body: formData,
  });
  const payload = await ensureSuccess(response);
  return payload.json();
}

function getDownloadName(contentDisposition, fallback) {
  const encodedName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encodedName) {
    try {
      return decodeURIComponent(encodedName.replace(/^"|"$/g, ''));
    } catch {
      return fallback;
    }
  }

  return contentDisposition.match(/filename="?([^";]+)"?/i)?.[1] || fallback;
}

export async function downloadDocument(userId, document) {
  const response = await fetch(
    `${API_BASE}/documents/${encodeURIComponent(document.id)}/download`,
    { headers: { 'X-User-Id': userId } },
  );
  await ensureSuccess(response);

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = objectUrl;
  link.download = getDownloadName(
    response.headers.get('Content-Disposition') || '',
    document.originalName,
  );
  window.document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
