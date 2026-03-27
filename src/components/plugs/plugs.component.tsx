'use client';
import { useState } from 'react';
import styles from './plugs.module.scss';

const INITIAL_PLUGS = [
  { id: '1', name: 'RSS Feed',  description: 'Auto-post content from any RSS or Atom feed directly to your social channels.', icon: '📡', connected: true,  docs: '#' },
  { id: '2', name: 'Zapier',    description: 'Connect AutoLaunch with 5,000+ apps and automate your entire content workflow.', icon: '⚡', connected: false, docs: '#' },
  { id: '3', name: 'Make.com',  description: 'Build powerful multi-step automations with Make\'s visual workflow builder.', icon: '🔧', connected: false, docs: '#' },
  { id: '4', name: 'Webhook',   description: 'Receive real-time data from any external source and trigger posts automatically.', icon: '🔗', connected: true,  docs: '#' },
  { id: '5', name: 'N8N',       description: 'Open-source workflow automation — self-host and own your integrations.', icon: '🔄', connected: false, docs: '#' },
  { id: '6', name: 'Public API', description: 'Integrate AutoLaunch directly into your own apps with our REST API.', icon: '🛠️', connected: false, docs: '#' },
];

export function PlugsComponent() {
  const [plugs, setPlugs] = useState(INITIAL_PLUGS);
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const toggle = async (id: string) => {
    setLoading(id);
    await new Promise((r) => setTimeout(r, 800));
    setPlugs((prev) => prev.map((p) => (p.id === id ? { ...p, connected: !p.connected } : p)));
    const plug = plugs.find((p) => p.id === id);
    setToast(`${plug?.name} ${plug?.connected ? 'disconnected' : 'connected'}`);
    setTimeout(() => setToast(''), 3000);
    setLoading(null);
  };

  const connectedCount = plugs.filter((p) => p.connected).length;

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}><span>✓</span> {toast}</div>}

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.pageTitle}>Plugins</span>
        </div>
        <div className={styles.summary}>
          <span className={styles.summaryPill}>{connectedCount} active</span>
          of {plugs.length} plugins
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.grid}>
          {plugs.map((plug) => (
            <div key={plug.id} className={`${styles.card} ${plug.connected ? styles.cardConnected : ''}`}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrap}>{plug.icon}</div>
                <div className={`${styles.badge} ${plug.connected ? styles.connected : ''}`}>
                  {plug.connected ? '● Active' : '○ Inactive'}
                </div>
              </div>
              <div className={styles.name}>{plug.name}</div>
              <div className={styles.desc}>{plug.description}</div>
              <div className={styles.cardFooter}>
                <a href={plug.docs} className={styles.docsLink}>View docs →</a>
                <button
                  type="button"
                  className={plug.connected ? styles.disconnectBtn : styles.connectBtn}
                  onClick={() => toggle(plug.id)}
                  disabled={loading === plug.id}
                >
                  {loading === plug.id
                    ? <span className={styles.loadingSpinner} />
                    : plug.connected ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
