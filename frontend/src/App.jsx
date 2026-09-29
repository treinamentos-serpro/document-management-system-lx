import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { downloadDocument, listDocuments, uploadDocument } from './services/documentsApi.js';
import './App.css';

export default function App() {
  const initialUserId = localStorage.getItem('dms-user-id') || 'usuario-local';
  const [userId, setUserId] = useState(initialUserId);
  const [userIdDraft, setUserIdDraft] = useState(initialUserId);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setDocuments([]);
    setNotice(null);
    listDocuments(userId)
      .then((payload) => {
        if (active) setDocuments(payload.documents);
      })
      .catch((error) => {
        if (active) setNotice({ type: 'error', message: error.message });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [userId]);

  function handleUserSubmit(event) {
    event.preventDefault();
    const nextUserId = userIdDraft.trim();
    if (!nextUserId) {
      setNotice({ type: 'error', message: 'Informe um identificador de usuário.' });
      return;
    }

    localStorage.setItem('dms-user-id', nextUserId);
    setNotice(null);
    setUserId(nextUserId);
  }

  async function handleUpload(file) {
    setUploading(true);
    setNotice(null);
    try {
      await uploadDocument(userId, file);
      const payload = await listDocuments(userId);
      setDocuments(payload.documents);
      setNotice({ type: 'success', message: 'Documento enviado com sucesso.' });
      return true;
    } catch (error) {
      setNotice({ type: 'error', message: error.message });
      return false;
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(document) {
    setNotice(null);
    try {
      await downloadDocument(userId, document);
    } catch (error) {
      setNotice({ type: 'error', message: error.message });
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="DMS, início">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span className="brand-name">DMS</span>
          <span className="brand-caption">DOCUMENT MANAGEMENT</span>
        </a>
        <form className="user-switcher" onSubmit={handleUserSubmit}>
          <label htmlFor="user-id">Usuário local</label>
          <input
            id="user-id"
            value={userIdDraft}
            onChange={(event) => setUserIdDraft(event.target.value)}
            aria-label="Identificador do usuário local"
          />
          <button type="submit">Aplicar</button>
        </form>
      </header>

      <main>
        <section className="page-intro">
          <span className="eyebrow">ESPAÇO DE TRABALHO / DOCUMENTOS</span>
          <h1>Seus documentos</h1>
          <p>Envie e acesse seus arquivos em um único lugar.</p>
        </section>

        {notice && (
          <div className={`alert${notice.type === 'success' ? ' alert-success' : ''}`} role="status">
            {notice.message}
          </div>
        )}

        <div className="workspace">
          <UploadComponent onUpload={handleUpload} uploading={uploading} />
          <DocumentList documents={documents} loading={loading} onDownload={handleDownload} />
        </div>

        <footer className="footer-note">
          Os documentos e identificadores pertencem ao ambiente local desta aplicação.
        </footer>
      </main>
    </div>
  );
}
