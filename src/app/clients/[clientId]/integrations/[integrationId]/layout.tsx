'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppShell from '@/components/layout/app-shell';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function IntegrationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { clientId: string; integrationId: string };
}) {
  const pathname = usePathname();
  const activeTab = pathname.includes('mapping') ? 'mapping' : 'settings';

  const baseUrl = `/clients/${params.clientId}/integrations/${params.integrationId}`;

  return (
    <AppShell>
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="settings" asChild>
            <Link href={`${baseUrl}/settings`}>Settings</Link>
          </TabsTrigger>
          <TabsTrigger value="mapping" asChild>
            <Link href={`${baseUrl}/mapping`}>Mapping</Link>
          </TabsTrigger>
        </TabsList>
        <div className="mt-6">{children}</div>
      </Tabs>
    </AppShell>
  );
}
