import React, { useState } from 'react';

export default function UploadPage() {
  const [image, setImage] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', image);

    const res = await fetch('/api/convert', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setResultUrl(data.imageUrl);
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ fontSize: '20px', marginBottom: '16px' }}>画像アップロード</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        style={{
          marginBottom: '12px',
          fontSize: '16px',
          width: '100%',
        }}
      />

      <button
        onClick={handleUpload}
        disabled={!image || loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          width: '100%',
          maxWidth: '300px',
          marginTop: '10px',
        }}
      >
        {loading ? '変換中...' : 'アップロードして変換'}
      </button>

      {resultUrl && (
        <div style={{ marginTop: '20px' }}>
          <h2>変換後の画像</h2>
          <img
            src={resultUrl}
            alt="Converted"
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
            }}
          />

          <a
            href={resultUrl}
            download="converted-image.png"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              fontSize: '16px',
              marginTop: '16px',
              backgroundColor: '#22c55e',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
            }}
          >
            画像をダウンロード
          </a>
        </div>
      )}
    </div>
  );
}
