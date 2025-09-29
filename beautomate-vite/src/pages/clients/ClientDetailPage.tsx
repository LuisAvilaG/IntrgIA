import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import IntegrationCard from '@/components/integrations/integration-card';
import { Client, Integration } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { apiGet } from '@/lib/api'; 

const transformIntegrationData = (data: any[]): Integration[] => {
  return data.map(item => {
    const [posSystemName = 'Unknown', erpSystemName = 'Unknown'] = (item.integratioType || '').split('-');
    return {
      // FIX: Use `integrationid` (lowercase) to match the backend response
      id: String(item.integrationid), 
      clientId: item.clientid,
      posSystem: { name: posSystemName, logo: `/logos/${posSystemName.toLowerCase()}.png` },
      erpSystem: { name: erpSystemName, logo: `/logos/${erpSystemName.toLowerCase()}.png` },
      status: String(item.status).toLowerCase(),
      lastSync: { date: 'N/A', status: 'success' }, 
      nextSync: 'N/A',
    };
  });
};

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!clientId) {
      setError("El ID del cliente no se encontró en la URL.");
      return;
    }
    
    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      const clientResponse = await apiGet(`/clients?id=${clientId}`);
      let clientData = clientResponse.data;
      if (Array.isArray(clientData) && clientData.length > 0) clientData = clientData[0];

      if (typeof clientData !== 'object' || clientData === null || !clientData.clientID) {
        throw new Error("Cliente no encontrado o el campo clientID falta en la respuesta.");
      }
      setClient(clientData);

      const compositeId = clientData.clientID;
      const integrationsResponse = await apiGet(`/integrations?clientId=${compositeId}`);
      
      if (Array.isArray(integrationsResponse.data)) {
        const transformedData = transformIntegrationData(integrationsResponse.data);
        setIntegrations(transformedData);
      } else {
        setIntegrations([]);
      }
    } catch (err: any) {
      setError(err.message || "No se pudieron cargar los datos del cliente.");
      toast.error(err.message || "No se pudieron cargar los datos del cliente.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid gap-6 md:grid-cols-2 lg-grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  if (!client) {
    return <div>Cliente no encontrado.</div>;
  }

  const newIntegrationUrl = `/clients/${clientId}/integrations/new`;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{client.clientName}</h1>
          <p className="text-muted-foreground">Administra las integraciones de {client.clientName}.</p>
        </div>
        <Button asChild>
          <Link to={newIntegrationUrl}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nueva Integración
          </Link>
        </Button>
      </div>

      {integrations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} onStatusChange={() => fetchData(false)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">Aún no hay Integraciones</h3>
          <p className="text-muted-foreground mt-2">Empieza creando la primera integración para este cliente.</p>
          <Button className="mt-4" asChild>
            <Link to={newIntegrationUrl}>
              <PlusCircle className="mr-2 h-4 w-4" /> Crear Integración
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
