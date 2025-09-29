import { Link } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ClientTable from '@/components/dashboard/client-table';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Client } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { apiGet } from '@/lib/api'; // Import our new API service

export default function Home() {
  const [n8nUrl, setN8nUrl] = useState(localStorage.getItem('n8nUrl') || '');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const response = await apiGet(`/clients`); // Use the new apiGet function
        if (response.data && Array.isArray(response.data)) {
          setClients(response.data);
        } else {
          setClients([]);
          console.warn("La respuesta del servidor no tiene el formato esperado:", response.data);
        }
      } catch (error: any) {
        console.error('Error al obtener los clientes:', error);
        // The error toast is now more generic as the specific cause is logged by the api service
        toast.error(error.message || 'No se pudieron cargar los clientes.');
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setN8nUrl(event.target.value);
  };

  const handleSaveUrl = () => {
    localStorage.setItem('n8nUrl', n8nUrl);
    toast.success('URL de n8n guardada exitosamente');
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Panel de Clientes</h1>
          <p className="text-muted-foreground">Una descripción general de todos sus clientes.</p>
        </div>
        <Button asChild>
          <Link to="/clients/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Cliente
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuración de n8n</CardTitle>
          <CardDescription>Configure la URL base de su instancia de n8n (ej: http://localhost:5678).</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="n8n-url">URL de n8n</Label>
            <Input id="n8n-url" placeholder="http://localhost:5678" value={n8nUrl} onChange={handleUrlChange} />
          </div>
          <Button onClick={handleSaveUrl} className="mt-6">Guardar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>Administre sus clientes y sus integraciones.</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar clientes..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <ClientTable clients={clients} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
