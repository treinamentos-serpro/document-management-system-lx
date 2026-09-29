import { useRef, useState } from 'react';

export default function UploadComponent({ onUpload, uploading }) {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || uploading) return;

    const uploaded = await onUpload(file);
    if (uploaded) {
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <form className="upload-panel" onSubmit={handleSubmit}>
      <div className="section-heading">
        <span className="section-index">01</span>
        <div>
          <h2>Adicionar documento</h2>
          <p>O arquivo fica armazenado localmente.</p>
        </div>
      </div>

      <label className="file-picker" htmlFor="document-file">
        <span className="file-picker-mark" aria-hidden="true">+</span>
        <span className="file-picker-copy">
          <strong>{file ? file.name : 'Escolha um arquivo'}</strong>
          <small>{file ? `${(file.size / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} KB` : 'Qualquer formato · até 10 MB'}</small>
        </span>
        <span className="file-picker-action">Procurar</span>
      </label>
      <input
        ref={inputRef}
        className="visually-hidden"
        id="document-file"
        type="file"
        onChange={(event) => setFile(event.target.files?.[0] || null)}
      />

      <button className="primary-button upload-submit" type="submit" disabled={!file || uploading}>
        {uploading ? 'Enviando...' : 'Enviar documento'}
      </button>
      <p className="quiet-note">Os nomes originais são preservados para download.</p>
    </form>
  );
}
