// Centralized API service layer

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export interface ApiPost {
  id: string;
  content: string;
  platforms: string[];
  mediaUrl?: string;
  scheduledAt?: string;
  status: 'scheduled' | 'posted' | 'failed' | 'draft';
  createdAt: string;
  errorMessage?: string;
}

export interface CreatePostPayload {
  text: string;
  platforms: string[];
  mediaUrl?: string;
  scheduledAt?: string; // ISO string
}

export interface ConnectedPlatform {
  id: string;
  name: string;
  provider: string;
  connectedAt: string;
  accountName?: string;
  avatarUrl?: string;
}

export interface GenerateCaptionPayload {
  topic: string;
  tone: 'professional' | 'casual' | 'marketing';
  platform?: string;
}

function getAuthHeaders(): HeadersInit {
  const token =
    typeof document !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((r) => r.startsWith('auth-token='))
          ?.split('=')[1]
      : undefined;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...getAuthHeaders(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Posts ──────────────────────────────────────────────────────────────────

export const postsApi = {
  list: () => request<{ posts: ApiPost[] }>('/api/posts'),

  create: (payload: CreatePostPayload) =>
    request<{ post: ApiPost }>('/api/post', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/api/posts/${id}`, { method: 'DELETE' }),
};

// ── Platforms ──────────────────────────────────────────────────────────────

export const platformsApi = {
  list: () => request<{ platforms: ConnectedPlatform[] }>('/api/platforms'),

  disconnect: (provider: string) =>
    request<{ success: boolean }>(`/api/platforms/${provider}`, { method: 'DELETE' }),
};

// ── AI ─────────────────────────────────────────────────────────────────────

export const aiApi = {
  generateCaption: (payload: GenerateCaptionPayload) =>
    request<{ caption: string }>('/api/generate-caption', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// ── Media ──────────────────────────────────────────────────────────────────

export const mediaApi = {
  upload: async (file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_URL}/api/media/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: form,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
};
