import { UserProvider } from '@/contexts/UserContext';
import { PlatformsProvider } from '@/contexts/PlatformsContext';
import { ToastProvider } from '@/contexts/ToastContext';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <PlatformsProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </PlatformsProvider>
    </UserProvider>
  );
}
