import DownloadButton from './DownloadButton.jsx';

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
} 

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function DocumentList({ documents, loading, listError, onRetry, onDownload }) {
  return (
    <section className="document-section" aria-labelledby="documents-heading">
      <div className="list-heading">
        <div>
          <span className="eyebrow">ARQUIVO PESSOAL</span>
          <h2 id="documents-heading">Documentos</h2>
        </div>
        <span className="document-count" aria-label={`${documents.length} documentos`}>
          {String(documents.length).padStart(2, '0')}
        </span>
      </div>

      {loading ? (
        <p className="list-message" role="status">Carregando documentos...</p>
      ) : listError ? (
        <div className="list-error" role="alert">
          <p>Não foi possível carregar os documentos: {listError}</p>
          <button type="button" onClick={onRetry}>Tentar novamente</button>
        </div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-mark" aria-hidden="true">—</span>
          <h3>Nenhum documento por aqui</h3>
          <p>Os arquivos enviados para este usuário aparecerão nesta lista.</p>
        </div>
      ) : (
        <div className="document-list">
          <div className="document-list-labels" aria-hidden="true">
            <span>Nome</span>
            <span>Tamanho</span>
            <span>Enviado em</span>
            <span />
          </div>
          {documents.map((document) => (
            <article className="document-row" key={document.id}>
              <div className="document-name">
                <span className="document-type" aria-hidden="true">DOC</span>
                <div>
                  <h3 title={document.originalName}>{document.originalName}</h3>
                  <p>Enviado por você</p>
                </div>
              </div>
              <span className="document-size">{formatFileSize(document.size)}</span>
              <time className="document-date" dateTime={document.uploadedAt}>
                {formatDate(document.uploadedAt)}
              </time>
              <DownloadButton document={document} onDownload={onDownload} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
