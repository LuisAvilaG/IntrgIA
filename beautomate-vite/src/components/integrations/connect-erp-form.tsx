'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiPost } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  consumerKey: z.string().min(1, 'Consumer Key is required'),
  consumerSecret: z.string().min(1, 'Consumer Secret is required'),
  tokenId: z.string().min(1, 'Token ID is required'),
  tokenSecret: z.string().min(1, 'Token Secret is required'),
});

type FormData = z.infer<typeof formSchema>;

interface ConnectErpFormProps {
  onNext: (data: FormData) => void;
  onBack: () => void;
  template: string | null;
  integrationId: string | null;
  initialData?: FormData | null;
}

export function ConnectErpForm({ onNext, onBack, template, integrationId, initialData }: ConnectErpFormProps) {
  const [isTesting, setIsTesting] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      accountId: '',
      consumerKey: '',
      consumerSecret: '',
      tokenId: '',
      tokenSecret: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const onSubmit = async (data: FormData) => {
    if (!integrationId) {
      toast.error("Error: No integration ID found. Please go back.");
      return;
    }
    
    setIsTesting(true);
    try {
      const payload = {
        integrationid: integrationId,
        ...data,
      };
      
      const response = await apiPost('/credentials/erp', payload);

      if (response.data.status === 'success') {
        toast.success("Connection successful!");
        onNext(data);
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
  
  const erpName = template ? template.split('-')[1].toUpperCase() : 'ERP';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect {erpName}</CardTitle>
        <CardDescription>Enter the NetSuite Token-Based Authentication details.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter NetSuite Account ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consumerKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consumer Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Consumer Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consumerSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consumer Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter Consumer Secret" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tokenId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Token ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tokenSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter Token Secret" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
