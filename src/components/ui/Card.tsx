'use client';

import { ReactNode } from 'react';
import styles from './Card.module.scss';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <div
      className={clsx(styles.card, className, {
        [styles.hover]: hover,
        [styles.clickable]: onClick,
      })}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
