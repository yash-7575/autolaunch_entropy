'use client';

import { useRouter } from 'next/navigation';
import styles from './BackButton.module.scss';

export default function BackButton() {
  const router = useRouter();

  return (
    <button className={styles.backButton} onClick={() => router.push('/')}>
      ← Back to Home
    </button>
  );
}
