import { Link, useParams } from 'react-router-dom';
import AppShell from '@/components/layout/app-shell';
import { getClientById, getIntegrationsByClientId } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import IntegrationCard from '@/components/integrations/integration-card';

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  
  // En una aplicación real, probablemente querrías un manejo de errores más robusto
  if (!clientId) {
    return <div>Client ID is missing</div>;
  }

  const client = getClientById(clientId);
  const integrations = getIntegrationsByClientId(clientId);

  if (!client) {
    // En una aplicación real, podrías redirigir a una página 404
    return <div>Client not found</div>;
  }

  const newIntegrationUrl = `/clients/${clientId}/integrations/new`;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-muted-foreground">Manage {client.name}'s integrations.</p>
        </div>
        <Button asChild>
          <Link to={newIntegrationUrl}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Integration
          </Link>
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
          <Button className="mt-4" asChild>
            <Link to={newIntegrationUrl}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Integration
            </Link>
          </Button>
        </div>
      )}
    </AppShell>
  );
}
