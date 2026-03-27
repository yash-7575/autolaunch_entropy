'use client';

import { useState } from 'react';
import PostDashboard from '@/components/post-dashboard/PostDashboard';
import PostComposer from '@/components/post-composer/PostComposer';

export default function PostsPage() {
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <>
      <PostDashboard onCreatePost={() => setComposerOpen(true)} />
      <PostComposer
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSuccess={() => setComposerOpen(false)}
      />
    </>
  );
}
