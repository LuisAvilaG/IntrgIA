import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import AppShell from '@/components/layout/app-shell';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function IntegrationLayout() {
  const { clientId, integrationId } = useParams<{ clientId: string; integrationId: string }>();
  const location = useLocation();
  const activeTab = location.pathname.includes('mapping') ? 'mapping' : 'settings';

  const baseUrl = `/clients/${clientId}/integrations/${integrationId}`;

  return (
    <AppShell>
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="settings" asChild>
            <Link to={`${baseUrl}/settings`}>Settings</Link>
          </TabsTrigger>
          <TabsTrigger value="mapping" asChild>
            <Link to={`${baseUrl}/mapping`}>Mapping</Link>
          </TabsTrigger>
        </TabsList>
        <div className="mt-6">
          {/* Las rutas hijas se renderizarán aquí */}
          <Outlet />
        </div>
      </Tabs>
    </AppShell>
  );
}
