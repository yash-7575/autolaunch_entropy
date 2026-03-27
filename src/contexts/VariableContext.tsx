'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface VariableContextType {
  backendUrl: string;
  backendInternalUrl: string;
  frontendUrl: string;
  storageProvider: string;
  uploadDirectory: string;
  isGeneral: boolean;
  notSecured: boolean;
  disableImageCompression: boolean;
  disableXAnalytics: boolean;
  stripePubKey?: string;
  sentryDsn?: string;
  posthogKey?: string;
  posthogHost?: string;
  facebookPixel?: string;
  datafastWebsiteId?: string;
  discordSupport?: string;
  extensionId?: string;
  mcpUrl?: string;
  oauth: {
    enabled: boolean;
    logoUrl?: string;
    displayName?: string;
  };
}

const VariableContext = createContext<VariableContextType | undefined>(undefined);

export function VariableProvider({ children }: { children: ReactNode }) {
  const variables: VariableContextType = {
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
    backendInternalUrl: process.env.BACKEND_INTERNAL_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
    storageProvider: process.env.STORAGE_PROVIDER || 'local',
    uploadDirectory: process.env.NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY || '/uploads',
    isGeneral: process.env.IS_GENERAL === 'true',
    notSecured: process.env.NOT_SECURED === 'true',
    disableImageCompression: process.env.DISABLE_IMAGE_COMPRESSION === 'true',
    disableXAnalytics: process.env.DISABLE_X_ANALYTICS === 'true',
    stripePubKey: process.env.STRIPE_PUBLISHABLE_KEY,
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    facebookPixel: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL,
    datafastWebsiteId: process.env.DATAFAST_WEBSITE_ID,
    discordSupport: process.env.NEXT_PUBLIC_DISCORD_SUPPORT,
    extensionId: process.env.EXTENSION_ID,
    mcpUrl: process.env.MCP_URL,
    oauth: {
      enabled: process.env.AUTOLAUNCH_GENERIC_OAUTH === 'true',
      logoUrl: process.env.NEXT_PUBLIC_AUTOLAUNCH_OAUTH_LOGO_URL,
      displayName: process.env.NEXT_PUBLIC_AUTOLAUNCH_OAUTH_DISPLAY_NAME,
    },
  };

  return (
    <VariableContext.Provider value={variables}>
      {children}
    </VariableContext.Provider>
  );
}

export function useVariables() {
  const context = useContext(VariableContext);
  if (context === undefined) {
    throw new Error('useVariables must be used within a VariableProvider');
  }
  return context;
}
