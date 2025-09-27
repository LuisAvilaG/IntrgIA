import Link from 'next/link';
import { notFound } from 'next/navigation';
import AppShell from '@/components/layout/app-shell';
import { getClientById, getIntegrationsByClientId } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import IntegrationCard from '@/components/integrations/integration-card';

export default function ClientDetailPage({ params }: { params: { clientId: string } }) {
  const client = getClientById(params.clientId);
  const integrations = getIntegrationsByClientId(params.clientId);

  if (!client) {
    notFound();
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-muted-foreground">Manage {client.name}'s integrations.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> New Integration
        </Button>
      </div>

      {integrations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No Integrations Yet</h3>
          <p className="text-muted-foreground mt-2">Get started by creating the first integration for this client.</p>
          <Button className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Integration
          </Button>
        </div>
      )}
    </AppShell>
  );
}
