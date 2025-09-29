'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiPost } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const sftpSchema = z.object({
  hostname: z.string().min(1, 'Hostname is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  port: z.coerce.number().optional(),
});

type FormData = z.infer<typeof sftpSchema>;

interface ConnectPosFormProps {
  onNext: (data: FormData) => void; // Pass data up on success
  onBack: () => void;
  template: string | null;
  integrationId: string | null;
  initialData?: FormData | null; // Receive initial/saved data
}

export function ConnectPosForm({ onNext, onBack, template, integrationId, initialData }: ConnectPosFormProps) {
  const [connectionType, setConnectionType] = useState('sftp');
  const [isTesting, setIsTesting] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(sftpSchema),
    // Use initialData to pre-fill the form, or default values
    defaultValues: initialData || {
      hostname: '',
      username: '',
      password: '',
      port: 22,
    },
  });

  // If initialData changes (e.g., user goes back and forth), reset the form
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const onSubmit = async (data: FormData) => {
    if (!integrationId) {
      toast.error("Error: No integration ID found. Please go back to the selection step.");
      return;
    }
    
    setIsTesting(true);
    try {
      const payload = {
        integrationid: integrationId,
        connectionType: connectionType,
        ...data,
      };
      
      const response = await apiPost('/credentials/pos', payload);

      if (response.data.status === 'success') {
        toast.success("Connection successful!");
        onNext(data); // Pass the successful data up to the parent before advancing
      } else {
        throw new Error(response.data.message || "Connection failed. Please check credentials.");
      }
    } catch (error: any) {
      console.error("Connection test failed:", error);
      toast.error(error.message);
    } finally {
      setIsTesting(false);
    }
  };
  
  const posName = template ? template.split('-')[0].toUpperCase() : 'POS';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect {posName}</CardTitle>
        <CardDescription>Enter the connection details for the Point of Sale system.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="connection-type">Connection Type</Label>
              <Select onValueChange={(value) => setConnectionType(value)} defaultValue={connectionType}>
                <SelectTrigger id="connection-type">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sftp">SFTP</SelectItem>
                  <SelectItem value="api" disabled>API (coming soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {connectionType === 'sftp' && (
              <>
                <FormField
                  control={form.control}
                  name="hostname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hostname</FormLabel>
                      <FormControl>
                        <Input placeholder="sftp.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="22" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="your-username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={onBack} type="button" disabled={isTesting}>Back</Button>
            <Button type="submit" disabled={isTesting}>
              {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Connection & Next
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
