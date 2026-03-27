'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLayout } from './LayoutContext';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
}

interface Subscription {
  tier: 'free' | 'pro' | 'business' | 'enterprise' | 'lifetime';
  status: 'active' | 'trialing' | 'canceled' | 'expired';
  trialEndsAt?: string;
  currentPeriodEnd?: string;
}

interface UserContextType {
  user: User | null;
  organization: Organization | null;
  subscription: Subscription | null;
  totalChannels: number;
  isLoading: boolean;
  isImpersonating: boolean;
  refetch: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { fetch: customFetch, apiUrl } = useLayout();
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [totalChannels, setTotalChannels] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await customFetch(apiUrl('/auth/me'));
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setOrganization(data.organization);
        setSubscription(data.subscription);
        setTotalChannels(data.totalChannels || 0);
        setIsImpersonating(data.isImpersonating || false);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchOrganization = async (orgId: string) => {
    try {
      const response = await customFetch(apiUrl('/user/switch-organization'), {
        method: 'POST',
        body: JSON.stringify({ organizationId: orgId }),
      });

      if (response.ok) {
        await fetchUserData();
      }
    } catch (error) {
      console.error('Failed to switch organization:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !organization) return false;
    
    // Owners and admins have all permissions
    if (organization.role === 'owner' || organization.role === 'admin') {
      return true;
    }

    // Define permission mappings
    const permissions: Record<string, string[]> = {
      'posts.create': ['owner', 'admin', 'member'],
      'posts.edit': ['owner', 'admin', 'member'],
      'posts.delete': ['owner', 'admin'],
      'analytics.view': ['owner', 'admin', 'member'],
      'settings.edit': ['owner', 'admin'],
      'billing.manage': ['owner'],
      'team.manage': ['owner', 'admin'],
    };

    const allowedRoles = permissions[permission] || [];
    return allowedRoles.includes(organization.role);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        organization,
        subscription,
        totalChannels,
        isLoading,
        isImpersonating,
        refetch: fetchUserData,
        switchOrganization,
        hasPermission,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
