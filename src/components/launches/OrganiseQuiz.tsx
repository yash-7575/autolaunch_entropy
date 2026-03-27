'use client';

import { useState } from 'react';
import styles from './OrganiseQuiz.module.scss';

const QUESTIONS = [
  {
    id: 'frequency',
    question: 'How often do you post on social media?',
    options: ['Daily', 'A few times a week', 'Weekly', 'Rarely'],
  },
  {
    id: 'struggle',
    question: "What's your biggest content challenge?",
    options: ['Coming up with ideas', 'Staying consistent', 'Managing multiple platforms', 'Measuring results'],
  },
  {
    id: 'goal',
    question: "What's your main goal with AutoLaunch?",
    options: ['Save time', 'Grow my audience', 'Stay organised', 'Automate everything'],
  },
];

export function OrganiseQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const current = QUESTIONS[step];

  const handleAnswer = (answer: string) => {
    const updated = { ...answers, [current.id]: answer };
    setAnswers(updated);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  return (
    <div className={styles.card}>
      <button className={styles.dismiss} onClick={() => setDismissed(true)} aria-label="Dismiss">✕</button>

      {done ? (
        <div className={styles.done}>
          <span className={styles.doneIcon}>🎯</span>
          <p className={styles.doneTitle}>You&apos;re all set!</p>
          <p className={styles.doneSub}>We&apos;ll personalise AutoLaunch based on your answers.</p>
        </div>
      ) : (
        <>
          <div className={styles.progress}>
            {QUESTIONS.map((_, i) => (
              <div key={i} className={`${styles.dot} ${i <= step ? styles.active : ''}`} />
            ))}
          </div>
          <p className={styles.question}>{current.question}</p>
          <div className={styles.options}>
            {current.options.map((opt) => (
              <button key={opt} className={styles.option} onClick={() => handleAnswer(opt)}>
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
