'use client';

import { useState, useEffect } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import styles from './Calendar.module.scss';

interface Post {
  id: string;
  content: string;
  scheduledAt: string;
  platforms: string[];
  status: 'scheduled' | 'published' | 'failed';
}

export default function Calendar() {
  const { fetch: customFetch, apiUrl } = useLayout();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [currentDate]);

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

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  const getPostsForDay = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0];
    
    return posts.filter(post => 
      post.scheduledAt.startsWith(dateStr)
    );
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.calendar}>
      <div className={styles.controls}>
        <button onClick={previousMonth} className={styles.navButton}>←</button>
        <h2 className={styles.monthName}>{monthName}</h2>
        <button onClick={nextMonth} className={styles.navButton}>→</button>
      </div>

      <div className={styles.grid}>
        <div className={styles.weekdays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className={styles.weekday}>{day}</div>
          ))}
        </div>

        <div className={styles.days}>
          {emptyDays.map(i => (
            <div key={`empty-${i}`} className={styles.emptyDay} />
          ))}
          
          {days.map(day => {
            const dayPosts = getPostsForDay(day);
            const isToday = 
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`${styles.day} ${isToday ? styles.today : ''}`}
              >
                <div className={styles.dayNumber}>{day}</div>
                <div className={styles.posts}>
                  {dayPosts.slice(0, 3).map(post => (
                    <div key={post.id} className={styles.post}>
                      <span className={styles.postContent}>
                        {post.content.substring(0, 30)}...
                      </span>
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <div className={styles.moreIndicator}>
                      +{dayPosts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className={styles.loading}>Loading posts...</div>
      )}
    </div>
  );
}
