'use client';

import { useState, useEffect } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import styles from './PostList.module.scss';

interface Post {
  id: string;
  content: string;
  scheduledAt: string;
  platforms: string[];
  status: 'scheduled' | 'published' | 'failed';
}

export default function PostList() {
  const { fetch: customFetch, apiUrl } = useLayout();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await customFetch(apiUrl('/posts'));
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading posts...</div>;
  }

  return (
    <div className={styles.list}>
      {posts.length === 0 ? (
        <div className={styles.empty}>
          <p>No posts scheduled yet</p>
          <p>Create your first post to get started</p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post.id} className={styles.postCard}>
            <div className={styles.postHeader}>
              <span className={`${styles.status} ${styles[post.status]}`}>
                {post.status}
              </span>
              <span className={styles.date}>
                {new Date(post.scheduledAt).toLocaleString()}
              </span>
            </div>
            <div className={styles.postContent}>{post.content}</div>
            <div className={styles.platforms}>
              {post.platforms.map(platform => (
                <span key={platform} className={styles.platform}>
                  {platform}
                </span>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
