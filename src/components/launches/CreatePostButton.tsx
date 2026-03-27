'use client';

import { useState } from 'react';
import styles from './CreatePostButton.module.scss';

export default function CreatePostButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={styles.button}
        onClick={() => setIsOpen(true)}
      >
        ✨ Create Post
      </button>

      {isOpen && (
        <div className={styles.modal} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create New Post</h2>
              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p>Post creation form will be implemented here</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
