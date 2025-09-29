'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { netsuiteSubsidiaries, netsuiteAccounts } from '@/lib/data';

// 1. Definimos el esquema de Zod basado en tu descripción
const settingsSchema = z.object({
  salesPostingMethod: z.enum(['journalEntry', 'itemizedInvoice']),
  subsidiary: z.string().min(1, "Subsidiary is required"),
  batchClearingAccount: z.string().min(1, "Account is required"),
  includeZeroSalesLines: z.boolean(),
  memo: z.enum(['posDate', 'storeDate', 'location', 'locationId', 'custom']),
  // customMemo: z.string().optional(), // Para la opción "Custom"
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  onNext: () => void;
  onBack: () => void;
  // Pasamos los datos iniciales si existen
  settings: Partial<SettingsFormValues>;
}

export default function SettingsForm({ onNext, onBack, settings }: SettingsFormProps) {
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      salesPostingMethod: settings.salesPostingMethod ?? 'journalEntry',
      subsidiary: settings.subsidiary ?? '',
      batchClearingAccount: settings.batchClearingAccount ?? '',
      includeZeroSalesLines: settings.includeZeroSalesLines ?? false,
      memo: settings.memo ?? 'posDate',
    },
  });

  const memoValue = form.watch('memo');
  const getMemoPreview = () => {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    switch (memoValue) {
      case 'posDate': return `Toast ${date}`;
      case 'storeDate': return `Store Name ${date}`;
      case 'location': return 'Location Name';
      case 'locationId': return 'Location-123';
      case 'custom': return 'Your custom memo...';
      default: return '';
    }
  };

  const onSubmit = (data: SettingsFormValues) => {
    console.log(data);
    toast({
      title: "Settings Validated",
      description: "Moving to the next step.",
    });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Define the high-level rules for how accounting entries are created.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="common">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="common">Common Settings</TabsTrigger>
                <TabsTrigger value="accounting">Accounting Options</TabsTrigger>
                <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
              </TabsList>
              <TabsContent value="common" className="mt-6 space-y-8">
                
                {/* Sales Posting Method */}
                <FormField
                  control={form.control}
                  name="salesPostingMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Sales Posting Method</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-row space-x-4">
                          <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="journalEntry" /></FormControl><FormLabel className="font-normal">Journal Entry</FormLabel></FormItem>
                          <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="itemizedInvoice" /></FormControl><FormLabel className="font-normal">Itemized Invoice</FormLabel></FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subsidiary */}
                <FormField
                  control={form.control}
                  name="subsidiary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subsidiary</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a subsidiary..." /></SelectTrigger></FormControl>
                        <SelectContent>{netsuiteSubsidiaries.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Batch Clearing Account */}
                <FormField
                  control={form.control}
                  name="batchClearingAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Clearing Account</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select an account..." /></SelectTrigger></FormControl>
                        <SelectContent>{netsuiteAccounts.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Include Zero Sales Lines */}
                <FormField
                  control={form.control}
                  name="includeZeroSalesLines"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5"><FormLabel>Include Zero Sales Lines</FormLabel></div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />

                {/* Memo */}
                <FormField
                  control={form.control}
                  name="memo"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Memo</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-4">
                           {['posDate', 'storeDate', 'location', 'locationId', 'custom'].map(val => (
                              <FormItem key={val} className="flex items-center space-x-2"><FormControl><RadioGroupItem value={val} /></FormControl><FormLabel className="font-normal capitalize">{val.replace('Date', ' + Date')}</FormLabel></FormItem>
                           ))}
                        </RadioGroup>
                      </FormControl>
                       <div className="text-sm text-muted-foreground italic pl-2">Preview: {getMemoPreview()}</div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="accounting" className="mt-6"><p className="text-muted-foreground text-center py-8">Accounting options coming soon.</p></TabsContent>
              <TabsContent value="segmentation" className="mt-6"><p className="text-muted-foreground text-center py-8">Segmentation options coming soon.</p></TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="outline" onClick={onBack}>Back</Button>
            <Button type="submit">Next</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
