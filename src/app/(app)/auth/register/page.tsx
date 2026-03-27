'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLayout } from '@/contexts/LayoutContext';
import { PostizLogo } from '@/components/layout/PostizLogo';
import styles from '../auth.module.scss';

export default function RegisterPage() {
  const router = useRouter();
  const { fetch: customFetch, apiUrl } = useLayout();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await customFetch(apiUrl('/auth/register'), {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (response.ok) {
        router.push('/launches');
      } else {
        const data = await response.json();
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.leftInner}>
          <div className={styles.logo}>
            <PostizLogo />
            AutoLaunch
          </div>

          <div className={styles.card}>
            <div className={styles.header}>
              <h1>Create Account</h1>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.field}>
                <label htmlFor="name">Full Name</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email Address</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>

              <div className={styles.field}>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" minLength={3} />
              </div>

              <button type="submit" className={styles.button} disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className={styles.footer}>
              Already have an account? <Link href="/auth/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.rightInner}>
          <div className={styles.rightBadge}>Join 20,000+ creators</div>
          <h2 className={styles.rightTitle}>
            Your audience is<br />
            waiting. <span className={styles.highlight}>Start today.</span>
          </h2>
          <p className={styles.rightSubtitle}>
            Set up in minutes. Schedule across every platform from one place.
          </p>

          <div className={styles.socialProof}>
            {[
              { icon: '🚀', stat: '10M+', label: 'Posts scheduled' },
              { icon: '📊', stat: '3x',   label: 'Avg. engagement boost' },
              { icon: '⏱️', stat: '5h',   label: 'Saved per week' },
            ].map((item) => (
              <div key={item.stat} className={styles.proofItem}>
                <span className={styles.proofIcon}>{item.icon}</span>
                <span className={styles.proofStat}>{item.stat}</span>
                <span className={styles.proofLabel}>{item.label}</span>
              </div>
            ))}
          </div>

          <video
            className={styles.rightVideo}
            src="/motion2Fast_Animate_this_modern_SaaS_dashboard_UI_where_a_user_0.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      </div>
    </div>
  );
}
