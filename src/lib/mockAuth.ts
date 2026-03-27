// Mock authentication for development/testing without backend

export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: string;
}

export interface MockOrganization {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
}

export interface MockSubscription {
  tier: 'free' | 'pro' | 'business' | 'enterprise' | 'lifetime';
  status: 'active' | 'trialing' | 'canceled' | 'expired';
  trialEndsAt?: string;
  currentPeriodEnd?: string;
}

// Mock users database
const MOCK_USERS: Record<string, { password: string; user: MockUser }> = {
  'demo@autolaunch.com': {
    password: 'demo123',
    user: {
      id: '1',
      email: 'demo@autolaunch.com',
      name: 'Demo User',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  },
  'test@autolaunch.com': {
    password: 'test123',
    user: {
      id: '2',
      email: 'test@autolaunch.com',
      name: 'Test User',
      role: 'user',
      createdAt: new Date().toISOString(),
    },
  },
};

// Mock organization
const MOCK_ORGANIZATION: MockOrganization = {
  id: 'org-1',
  name: 'My Organization',
  slug: 'my-org',
  role: 'owner',
};

// Mock subscription
const MOCK_SUBSCRIPTION: MockSubscription = {
  tier: 'pro',
  status: 'active',
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export const mockAuth = {
  // Login - Accept any email and password
  login: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    // Check if user exists in mock database
    let userRecord = MOCK_USERS[email];
    
    // If user doesn't exist, create a new one on the fly
    if (!userRecord) {
      const newUser: MockUser = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0], // Use email prefix as name
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      
      userRecord = { password, user: newUser };
      MOCK_USERS[email] = userRecord;
    }

    const token = btoa(JSON.stringify({ userId: userRecord.user.id, email }));
    return {
      token,
      user: userRecord.user,
      organization: MOCK_ORGANIZATION,
      subscription: MOCK_SUBSCRIPTION,
    };
  },

  // Register
  register: async (name: string, email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (MOCK_USERS[email]) {
      throw new Error('Email already exists');
    }

    const newUser: MockUser = {
      id: Date.now().toString(),
      email,
      name,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    // In a real app, this would save to database
    MOCK_USERS[email] = { password, user: newUser };

    const token = btoa(JSON.stringify({ userId: newUser.id, email }));
    return {
      token,
      user: newUser,
      organization: MOCK_ORGANIZATION,
      subscription: { ...MOCK_SUBSCRIPTION, tier: 'free' as const },
    };
  },

  // Get current user
  me: async (token: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const decoded = JSON.parse(atob(token));
      const userRecord = Object.values(MOCK_USERS).find(
        u => u.user.id === decoded.userId
      );

      if (!userRecord) {
        throw new Error('User not found');
      }

      return {
        user: userRecord.user,
        organization: MOCK_ORGANIZATION,
        subscription: MOCK_SUBSCRIPTION,
        totalChannels: 3,
        isImpersonating: false,
      };
    } catch {
      throw new Error('Invalid token');
    }
  },

  // Logout
  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true };
  },
};

// In-memory posts store
const MOCK_POSTS_STORE: Array<{
  id: string;
  content: string;
  scheduledAt: string;
  platforms: string[];
  status: 'scheduled' | 'published' | 'failed';
}> = [
  {
    id: '1',
    content: 'Check out our new product launch! 🚀 #ProductLaunch #Innovation',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    platforms: ['Twitter', 'LinkedIn', 'Facebook'],
    status: 'scheduled',
  },
  {
    id: '2',
    content: 'Behind the scenes of our latest campaign. Stay tuned for more updates!',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    platforms: ['Instagram', 'Twitter'],
    status: 'scheduled',
  },
  {
    id: '3',
    content: 'Thank you for 10k followers! We appreciate your support 🎉',
    scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    platforms: ['Twitter', 'LinkedIn'],
    status: 'published',
  },
];

// Mock posts data
export const mockPosts = {
  create: async (data: { content: string; platforms: string[]; scheduledAt?: string }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const post = {
      id: Date.now().toString(),
      content: data.content,
      platforms: data.platforms,
      scheduledAt: data.scheduledAt || new Date().toISOString(),
      status: data.scheduledAt ? ('scheduled' as const) : ('published' as const),
    };
    MOCK_POSTS_STORE.push(post);
    return { post };
  },

  list: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      posts: MOCK_POSTS_STORE,
    };
  },
};
