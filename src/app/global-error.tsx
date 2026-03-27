'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '24px',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</h1>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Something went wrong!</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>{error.message}</p>
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              background: '#6366f1',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
