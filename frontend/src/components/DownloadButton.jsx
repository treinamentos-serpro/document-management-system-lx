import { useState } from 'react';

export default function DownloadButton({ onDownload, document }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try { 
      await onDownload(document);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      className="download-button"
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      aria-label={`Baixar ${document.originalName}`}
    >
      {downloading ? 'Baixando...' : 'Baixar'}
    </button>
  );
}
