'use client';
import { useState } from 'react';
import styles from './billing.module.scss';

const PLANS = [
  {
    id: 'free', name: 'Free', tag: '',
    features: ['3 social accounts', '10 posts/month', 'Basic analytics', 'Community support'],
  },
  {
    id: 'pro', name: 'Pro', popular: true, tag: 'Most Popular',
    features: ['10 social accounts', 'Unlimited posts', 'Advanced analytics', 'AI content generation', 'Priority support', 'Brand voice learning'],
  },
  {
    id: 'business', name: 'Business', tag: 'Best Value',
    features: ['Unlimited accounts', 'Unlimited posts', 'Full analytics suite', 'AI + automation', 'Team collaboration', 'White-label', 'Dedicated support'],
  },
];

const INVOICES = [
  { date: 'Mar 1, 2026', desc: 'Pro Plan — Monthly' },
  { date: 'Feb 1, 2026', desc: 'Pro Plan — Monthly' },
  { date: 'Jan 1, 2026', desc: 'Free Plan' },
];

export function BillingComponent() {
  const [current, setCurrent] = useState('free');
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const handleUpgrade = async (planId: string) => {
    if (planId === current) return;
    setLoading(planId);
    await new Promise((r) => setTimeout(r, 1000));
    setCurrent(planId);
    setLoading(null);
    const plan = PLANS.find((p) => p.id === planId);
    setToast(`✓ Upgraded to ${plan?.name} plan`);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}>{toast}</div>}
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>Simple, transparent plans</h2>
          <p className={styles.subtitle}>Start free. Upgrade when you need more.</p>
        </div>

        <div className={styles.plans}>
          {PLANS.map((plan) => {
            const isCurrent = current === plan.id;
            return (
              <div
                key={plan.id}
                className={`${styles.planCard} ${plan.popular ? styles.popular : ''} ${isCurrent ? styles.current : ''}`}
              >
                {plan.popular && <div className={styles.popularBadge}>✦ Most Popular</div>}
                {isCurrent && <div className={styles.currentBadge}>✓ Active</div>}

                <div className={styles.planHeader}>
                  <div className={styles.planName}>{plan.name}</div>
                  {plan.tag && !plan.popular && <div className={styles.planTag}>{plan.tag}</div>}
                </div>

                <div className={styles.divider} />

                <ul className={styles.features}>
                  {plan.features.map((f) => (
                    <li key={f} className={styles.feature}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={isCurrent ? styles.currentBtn : styles.upgradeBtn}
                  disabled={isCurrent || loading === plan.id}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {loading === plan.id
                    ? 'Processing…'
                    : isCurrent
                    ? '✓ Current Plan'
                    : plan.id === 'free' ? 'Get started free' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <div className={styles.invoiceSection}>
          <div className={styles.invoiceHeader}>
            <h3 className={styles.invoiceTitle}>Billing History</h3>
          </div>
          <table className={styles.invoiceTable}>
            <thead>
              <tr><th>Date</th><th>Description</th><th>Status</th></tr>
            </thead>
            <tbody>
              {INVOICES.map((inv, i) => (
                <tr key={i}>
                  <td>{inv.date}</td>
                  <td>{inv.desc}</td>
                  <td><span className={styles.paid}>Paid</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
