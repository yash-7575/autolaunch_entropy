'use client';

import { useState, useEffect, useCallback } from 'react';
import { postsApi, ApiPost } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { getPlatform } from '@/lib/platforms';
import styles from './PostDashboard.module.scss';

type Filter = 'all' | 'scheduled' | 'posted' | 'failed' | 'draft';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'posted', label: 'Posted' },
  { key: 'failed', label: 'Failed' },
  { key: 'draft', label: 'Draft' },
];

const STATUS_DOT: Record<string, string> = {
  posted: '●', scheduled: '◷', failed: '✕', draft: '○',
};

interface PostDashboardProps {
  onCreatePost?: () => void;
}

export default function PostDashboard({ onCreatePost }: PostDashboardProps) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await postsApi.list();
      setPosts(data.posts);
    } catch {
      toast('Failed to load posts', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await postsApi.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast('Post deleted');
    } catch {
      toast('Failed to delete post', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = filter === 'all' ? posts : posts.filter((p) => p.status === filter);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Posts</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className={styles.filters}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`${styles.filterBtn} ${filter === f.key ? styles.active : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {onCreatePost && (
            <button type="button" className={styles.createBtn} onClick={onCreatePost}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              New Post
            </button>
          )}
        </div>
      </div>

      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th>Content</th>
            <th>Platforms</th>
            <th>Status</th>
            <th>Scheduled</th>
            <th></th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  {[200, 120, 80, 100, 30].map((w, j) => (
                    <td key={j}><div className={styles.skeletonCell} style={{ width: w }} /></td>
                  ))}
                </tr>
              ))
            : filtered.length === 0
            ? (
                <tr>
                  <td colSpan={5}>
                    <div className={styles.empty}>
                      <p>No posts found</p>
                      <p>
                        {filter === 'all'
                          ? 'Create your first post to get started.'
                          : `No ${filter} posts yet.`}
                      </p>
                    </div>
                  </td>
                </tr>
              )
            : filtered.map((post) => (
                <tr key={post.id}>
                  <td><div className={styles.content}>{post.content}</div></td>
                  <td>
                    <div className={styles.platforms}>
                      {post.platforms.map((pid) => {
                        const p = getPlatform(pid);
                        return (
                          <span
                            key={pid}
                            className={styles.platformTag}
                            style={{
                              color: p?.color ?? '#888',
                              background: `${p?.color ?? '#888'}18`,
                              borderColor: `${p?.color ?? '#888'}30`,
                            }}
                          >
                            {p?.icon}
                            {p?.name ?? pid}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[post.status]}`}>
                      {STATUS_DOT[post.status]} {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={styles.timestamp}>
                      {post.scheduledAt
                        ? new Date(post.scheduledAt).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      aria-label="Delete post"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
