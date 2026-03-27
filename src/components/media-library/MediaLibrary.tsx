'use client';

import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';
import styles from './MediaLibrary.module.scss';

type FileType = 'all' | 'image' | 'video' | 'document';

interface MediaFile {
  id: string;
  name: string;
  size: string;
  type: FileType;
  url: string;
  date: string;
}

const SEED: MediaFile[] = [
  { id: 'u1', name: 'brand-hero.png',   size: '1.2 MB', type: 'image',    url: '', date: 'Mar 18, 2026' },
  { id: 'u2', name: 'product-demo.mp4', size: '24 MB',  type: 'video',    url: '', date: 'Mar 15, 2026' },
  { id: 'u3', name: 'logo-white.svg',   size: '48 KB',  type: 'image',    url: '', date: 'Mar 10, 2026' },
  { id: 'u4', name: 'team-photo.jpg',   size: '3.4 MB', type: 'image',    url: '', date: 'Mar 5, 2026'  },
  { id: 'u5', name: 'brand-guide.pdf',  size: '5.1 MB', type: 'document', url: '', date: 'Feb 28, 2026' },
];

const TYPE_ICON: Record<string, string> = { image: '🖼️', video: '🎬', document: '📄' };

export default function MediaLibrary() {
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFile[]>(SEED);
  const [filter, setFilter] = useState<FileType>('all');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    const next: MediaFile[] = Array.from(list).map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: f.size > 1_000_000
        ? `${(f.size / 1_000_000).toFixed(1)} MB`
        : `${Math.round(f.size / 1000)} KB`,
      type: f.type.startsWith('video') ? 'video' : f.type.startsWith('image') ? 'image' : 'document',
      url: f.type.startsWith('image') ? URL.createObjectURL(f) : '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));
    setFiles((prev) => [...next, ...prev]);
    toast(`${next.length} file${next.length > 1 ? 's' : ''} uploaded`);
  }, [toast]);

  const remove = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast('File removed');
  };

  const filtered = filter === 'all' ? files : files.filter((f) => f.type === filter);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Media Library</h1>
        <button type="button" className={styles.uploadBtn} onClick={() => fileRef.current?.click()}>
          + Upload Files
        </button>
      </div>

      <div
        className={`${styles.dropZone} ${isDragging ? styles.active : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
        aria-label="Upload media files"
      >
        <div className={styles.dropIcon}>☁️</div>
        <div className={styles.dropText}>Drag & drop files here, or click to browse</div>
        <div className={styles.dropHint}>Images, videos, PDFs · Max 50 MB each</div>
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        style={{ display: 'none' }}
        aria-label="File upload input"
        onChange={(e) => addFiles(e.target.files)}
      />

      <div className={styles.filters}>
        {(['all', 'image', 'video', 'document'] as FileType[]).map((f) => (
          <button
            key={f}
            type="button"
            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {' '}({f === 'all' ? files.length : files.filter((x) => x.type === f).length})
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>No {filter === 'all' ? '' : filter + ' '}files yet</div>
        ) : (
          filtered.map((f) => (
            <div key={f.id} className={styles.card}>
              <div className={styles.thumb}>
                {f.url
                  ? <img src={f.url} alt={f.name} />
                  : <span>{TYPE_ICON[f.type] ?? '📁'}</span>
                }
              </div>
              <div className={styles.meta}>
                <div className={styles.fileName}>{f.name}</div>
                <div className={styles.fileInfo}>{f.size} · {f.date}</div>
              </div>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => remove(f.id)}
                  aria-label={`Delete ${f.name}`}
                >✕</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
