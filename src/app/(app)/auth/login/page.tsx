'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useLayout } from '@/contexts/LayoutContext';
import { PostizLogo } from '@/components/layout/PostizLogo';
import Link from 'next/link';
import styles from '../auth.module.scss';

function LoginForm() {
  const searchParams = useSearchParams();
  const { fetch: customFetch, apiUrl } = useLayout();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/launches';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await customFetch(apiUrl('/auth/login'), {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        window.location.href = redirect.startsWith('/') ? redirect : '/launches';
      } else {
        const data = await response.json();
        setError(data.message || 'Invalid email or password.');
        setIsLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
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
              <h1>Welcome back</h1>
              <p>Sign in to your account to continue</p>
            </div>

            <div className={styles.oauthGroup}>
              <button type="button" className={styles.oauthBtn} data-provider="google"
                onClick={() => signIn('google', { callbackUrl: redirect })} disabled={isLoading}>
                <GoogleIcon />
                Continue with Google
              </button>
              <button type="button" className={styles.oauthBtn} data-provider="linkedin"
                onClick={() => signIn('linkedin', { callbackUrl: redirect })} disabled={isLoading}>
                <LinkedInIcon />
                Continue with LinkedIn
              </button>
            </div>

            <div className={styles.divider}><span>or</span></div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.field}>
                <label htmlFor="email">Email address</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required placeholder="you@example.com" autoComplete="email" />
              </div>
              <div className={styles.field}>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required placeholder="••••••••" autoComplete="current-password" />
              </div>
              <button type="submit" className={styles.button} disabled={isLoading}>
                <span className={styles.btnInner}>
                  {isLoading && <span className={styles.btnSpinner} />}
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </span>
              </button>
            </form>

            <p className={styles.footer}>
              Don&apos;t have an account? <Link href="/auth/register">Create one free</Link>
            </p>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.rightInner}>
          <span className={styles.rightBadge}>✦ Social Media OS</span>
          <h2 className={styles.rightTitle}>Schedule smarter,<br /><span className={styles.highlight}>grow faster</span></h2>
          <p className={styles.rightSubtitle}>AutoLaunch helps you plan, publish, and analyse content across every platform — all in one place.</p>
          <div className={styles.socialProof}>
            <div className={styles.proofItem}><span className={styles.proofIcon}>⚡</span><span className={styles.proofStat}>8x</span><span className={styles.proofLabel}>Faster scheduling</span></div>
            <div className={styles.proofItem}><span className={styles.proofIcon}>🕐</span><span className={styles.proofStat}>2h</span><span className={styles.proofLabel}>Saved per week</span></div>
            <div className={styles.proofItem}><span className={styles.proofIcon}>📈</span><span className={styles.proofStat}>3x</span><span className={styles.proofLabel}>More engagement</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
