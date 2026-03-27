'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { platformsApi, ConnectedPlatform } from '@/lib/api';

interface PlatformsContextType {
  platforms: ConnectedPlatform[];
  isLoading: boolean;
  refetch: () => Promise<void>;
  disconnect: (provider: string) => Promise<void>;
  isConnected: (provider: string) => boolean;
}

const PlatformsContext = createContext<PlatformsContextType | undefined>(undefined);

// Seed from localStorage so OAuth redirects don't wipe state
function loadLocal(): ConnectedPlatform[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('al_connected_platforms');
    if (!raw) return [];
    const map: Record<string, { name: string; connectedAt: number }> = JSON.parse(raw);
    return Object.entries(map).map(([provider, v]) => ({
      id: provider,
      name: v.name,
      provider,
      connectedAt: new Date(v.connectedAt).toISOString(),
    }));
  } catch {
    return [];
  }
}

export function PlatformsProvider({ children }: { children: ReactNode }) {
  const [platforms, setPlatforms] = useState<ConnectedPlatform[]>(loadLocal);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await platformsApi.list();
      setPlatforms(data.platforms);
    } catch {
      // Fall back to localStorage-seeded data silently
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const disconnect = useCallback(async (provider: string) => {
    await platformsApi.disconnect(provider).catch(() => null);
    setPlatforms((prev) => prev.filter((p) => p.provider !== provider));
    // Sync localStorage
    try {
      const raw = localStorage.getItem('al_connected_platforms');
      if (raw) {
        const map = JSON.parse(raw);
        delete map[provider];
        localStorage.setItem('al_connected_platforms', JSON.stringify(map));
      }
    } catch {}
  }, []);

  const isConnected = useCallback(
    (provider: string) => platforms.some((p) => p.provider === provider),
    [platforms],
  );

  return (
    <PlatformsContext.Provider value={{ platforms, isLoading, refetch, disconnect, isConnected }}>
      {children}
    </PlatformsContext.Provider>
  );
}

export function usePlatforms() {
  const ctx = useContext(PlatformsContext);
  if (!ctx) throw new Error('usePlatforms must be used inside PlatformsProvider');
  return ctx;
}
