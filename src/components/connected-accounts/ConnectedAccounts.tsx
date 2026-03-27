'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { usePlatforms } from '@/contexts/PlatformsContext';
import { useToast } from '@/contexts/ToastContext';
import { PLATFORMS } from '@/lib/platforms';
import styles from './ConnectedAccounts.module.scss';

export default function ConnectedAccounts() {
  const { isConnected, disconnect, isLoading } = usePlatforms();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleConnect = async (provider: string, name: string) => {
    setLoadingId(provider);
    try {
      await signIn(provider, { callbackUrl: '/third-party' });
    } catch {
      toast(`Failed to connect ${name}`, 'error');
      setLoadingId(null);
    }
  };

  const handleDisconnect = async (provider: string, name: string) => {
    setLoadingId(provider);
    try {
      await disconnect(provider);
      toast(`${name} disconnected`);
    } catch {
      toast(`Failed to disconnect ${name}`, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Connected Accounts</h1>
        <p>Connect your social platforms to start scheduling and publishing posts.</p>
      </div>

      <div className={styles.list}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))
          : PLATFORMS.map((p) => {
              const connected = isConnected(p.provider);
              const busy = loadingId === p.provider;
              return (
                <div
                  key={p.id}
                  className={`${styles.row} ${connected ? styles.connected : ''}`}
                >
                  <div
                    className={styles.iconWrap}
                    style={{ background: `${p.color}18`, color: p.color }}
                  >
                    {p.icon}
                  </div>

                  <div className={styles.info}>
                    <div className={styles.name}>{p.name}</div>
                    <div className={styles.subtitle}>{p.subtitle}</div>
                  </div>

                  <div className={styles.actions}>
                    {connected && (
                      <span className={styles.badge}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Connected
                      </span>
                    )}

                    {connected ? (
                      <button
                        type="button"
                        className={styles.disconnectBtn}
                        onClick={() => handleDisconnect(p.provider, p.name)}
                        disabled={busy}
                        aria-label={`Disconnect ${p.name}`}
                      >
                        {busy ? <span className={styles.spinner} /> : 'Disconnect'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.connectBtn}
                        onClick={() => handleConnect(p.provider, p.name)}
                        disabled={busy}
                        aria-label={`Connect ${p.name}`}
                      >
                        {busy ? <span className={styles.spinner} /> : 'Connect'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
