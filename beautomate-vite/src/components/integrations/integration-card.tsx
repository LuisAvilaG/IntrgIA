import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings, FileText, Pause, Play, Loader2 } from 'lucide-react';
import { Integration } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { apiPost } from '@/lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface IntegrationCardProps {
  integration: Integration;
  onStatusChange: () => void; // Callback to tell the parent to refetch data
}

export default function IntegrationCard({ integration, onStatusChange }: IntegrationCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const integrationUrl = `/clients/${integration.clientId}/integrations/${integration.id}/settings`;
  const isActive = integration.status === 'active';

  const handleToggleStatus = async () => {
    setIsToggling(true);
    const newStatus = isActive ? 'paused' : 'active';
    
    try {
      const response = await apiPost('/integrations/status', {
        integrationid: integration.id, // Ensure we use the lowercase id
        newStatus: newStatus,
      });

      if (response.data.status === 'success') {
        toast.success(`Integración ${newStatus === 'active' ? 'activada' : 'pausada'}`);
        onStatusChange(); // Tell the parent component to refresh its data
      } else {
        toast.error('No se pudo cambiar el estado.');
      }
    } catch (error) {
      console.error("Error al cambiar el estado de la integración:", error);
      toast.error('Ocurrió un error en el servidor.');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card className="flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3"> {/* Increased gap for more space */}
            <span
              className={cn(
                'w-3 h-3 rounded-full',
                {
                  'bg-green-500': integration.status === 'active',
                  'bg-yellow-500': integration.status === 'paused',
                  'bg-gray-400': integration.status !== 'active' && integration.status !== 'paused'
                }
              )}
              title={`Status: ${integration.status}`}
            />
            {integration.posSystem?.name} to {integration.erpSystem?.name}
          </CardTitle>
          <div className="flex items-center space-x-1">
             <Button variant="ghost" size="icon" onClick={handleToggleStatus} title={isActive ? 'Pause Integration' : 'Activate Integration'} disabled={isToggling}>
                {isToggling ? <Loader2 className="h-4 w-4 animate-spin" /> : (isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />)}
             </Button>
             <Button variant="ghost" size="icon" asChild>
                <Link to={integrationUrl} title="Settings">
                    <Settings className="h-4 w-4" />
                </Link>
             </Button>
             <Button variant="ghost" size="icon" onClick={() => alert('Viewing logs...')} title="View Logs">
                <FileText className="h-4 w-4" />
             </Button>
          </div>
        </div>
        <CardDescription className="pt-2">Syncs sales and customer data.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-around text-center">
            <div className="flex flex-col items-center gap-2">
                <img src={integration.posSystem?.logo} alt={integration.posSystem?.name || 'POS'} className="h-[100px] w-[100px] object-contain" />
                <span className="text-xs font-semibold">{integration.posSystem?.name}</span>
            </div>
            <ArrowRight className="text-gray-300 mx-4" />
            <div className="flex flex-col items-center gap-2">
                <img src={integration.erpSystem?.logo} alt={integration.erpSystem?.name || 'ERP'} className="h-[100px] w-[100px] object-contain" />
                <span className="text-xs font-semibold">{integration.erpSystem?.name}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start pt-4 border-t">
        <div className="flex justify-between w-full text-xs text-muted-foreground">
            <span>Last Sync</span>
            <span>{integration.lastSync?.date || 'N/A'}</span>
        </div>
        <div className="flex justify-between w-full text-xs text-muted-foreground mt-1">
            <span>Next Sync</span>
            <span>{integration.nextSync || 'N/A'}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
