import { ThirdPartyComponent } from '@/components/third-party/third-party.component';
import ConnectedAccounts from '@/components/connected-accounts/ConnectedAccounts';

export const metadata = { title: 'AutoLaunch Integrations' };

export default function ThirdPartyPage() {
  return (
    <>
      <ConnectedAccounts />
      <ThirdPartyComponent />
    </>
  );
}
