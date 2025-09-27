import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import AppShell from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// 1. Define el esquema de validación con Zod
const clientFormSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactEmail: z.string().email('Invalid email address'),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function NewClientPage() {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      clientName: '',
      contactPerson: '',
      contactEmail: '',
    },
  });

  // 2. Define el manejador de envío
  function onSubmit(values: ClientFormValues) {
    // Aquí es donde harías la llamada a tu API para crear el cliente
    console.log(values);
    // Por ejemplo: fetch('/api/clients', { method: 'POST', body: JSON.stringify(values) });
  }

  return (
    <AppShell>
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Client</CardTitle>
          <CardDescription>Fill out the form below to add a new client to the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 3. Usa el componente Form de shadcn/ui */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Global Food Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit">Create Client</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
