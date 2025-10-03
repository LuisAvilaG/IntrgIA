'use client';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import toast from 'react-hot-toast';
import { useEffect, useState, useMemo } from 'react';
import { apiPost } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { ReactSelectCombobox, ComboboxOption } from '../ui/react-select-combobox';

type SelectOption = { id: string; name: string; };

const settingsSchema = z.object({
  subsidiary: z.string().min(1, "Subsidiary is required"),
  batchClearingAccount: z.string().min(1, "Batch Clearing Account is required"),
  salesPostingMethod: z.enum(['journalEntry', 'itemizedInvoice']).default('journalEntry'),
  includeZeroSalesLines: z.boolean().default(false),
  memo: z.enum(['posDate', 'storeDate', 'location', 'locationId', 'custom']).default('posDate'),
  inventorySync: z.boolean().default(false),
  salesSummaryLevel: z.enum(['category', 'revenueCenter', 'sku']).default('category'),
  overShortHandling: z.enum(['ignore', 'singleLine']).default('ignore'),
  locationSource: z.enum(['subsidiaryDefault', 'mapFromRevenueCenter']).default('subsidiaryDefault'),
  overShortAccount: z.string().optional().default(''),
  giftCardLiabilityAccount: z.string().optional().default(''),
  defaultClass: z.string().optional().default(''),
  defaultDepartment: z.string().optional().default(''),
}).refine(data => {
    if (data.overShortHandling === 'singleLine' && !data.overShortAccount) return false;
    return true;
}, { message: "An account must be selected for Over/Short handling.", path: ["overShortAccount"] });

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  onNext: (analysisData: any) => void;
  onBack: () => void;
  settings: Partial<SettingsFormValues>;
  integrationId: string | null;
}

export default function SettingsForm({ onNext, onBack, settings, integrationId }: SettingsFormProps) {
  const [isSubsidiaryLoading, setIsSubsidiaryLoading] = useState(true);
  const [isMappingsLoading, setIsMappingsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subsidiaries, setSubsidiaries] = useState<SelectOption[]>([]);
  const [discoveredData, setDiscoveredData] = useState<any>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  const selectedSubsidiary = useWatch({ control: form.control, name: 'subsidiary' });

  // **LÓGICA DE CARGA RESTAURADA**
  useEffect(() => {
    const controller = new AbortController();
    const fetchSubsidiaries = async () => {
      if (!integrationId) { toast.error("Integration ID missing."); setIsSubsidiaryLoading(false); return; }
      setIsSubsidiaryLoading(true);
      try {
        const response = await apiPost('/api/discover-subsidiaries', { integrationId }, controller.signal);
        let responseData = response.data;
        if (Array.isArray(responseData) && responseData.length > 0) responseData = responseData[0];
        if (responseData.status === 'success' && responseData.data?.subsidiaries) {
          setSubsidiaries(responseData.data.subsidiaries);
        } else {
          throw new Error(responseData.message || 'Failed to fetch subsidiaries.');
        }
      } catch (error: any) {
        if (!axios.isCancel(error)) toast.error(`Failed to load subsidiaries: ${error.message}`);
      } finally {
        if (!controller.signal.aborted) setIsSubsidiaryLoading(false);
      }
    };
    fetchSubsidiaries();
    return () => controller.abort();
  }, [integrationId]);

  useEffect(() => {
    if (!selectedSubsidiary) { setDiscoveredData(null); return; }
    const controller = new AbortController();
    const fetchMappings = async () => {
      setIsMappingsLoading(true);
      setDiscoveredData(null);
      try {
        const response = await apiPost('/api/discover-mappings', { integrationId, subsidiaryId: selectedSubsidiary }, controller.signal);
        let responseData = response.data;
        if (Array.isArray(responseData) && responseData.length > 0) responseData = responseData[0];
        if (responseData.status === 'success' && responseData.data?.netsuite) {
          setDiscoveredData(responseData.data.netsuite);
        } else {
          throw new Error(responseData.message || 'Failed to fetch mapping data.');
        }
      } catch (error: any) {
         if (!axios.isCancel(error)) toast.error(`Failed to load mappings: ${error.message}`);
      } finally {
        if (!controller.signal.aborted) setIsMappingsLoading(false);
      }
    };
    fetchMappings();
    return () => controller.abort();
  }, [selectedSubsidiary, integrationId]);

  const transformToComboboxOptions = (items: SelectOption[] = []): ComboboxOption[] => items.map(item => ({ value: item.id, label: item.name }));
  const accountOptions = useMemo(() => transformToComboboxOptions(discoveredData?.accounts), [discoveredData]);
  const classOptions = useMemo(() => transformToComboboxOptions(discoveredData?.classes), [discoveredData]);
  const departmentOptions = useMemo(() => transformToComboboxOptions(discoveredData?.departments), [discoveredData]);

  const overShortValue = form.watch('overShortHandling');
  const isDisabled = !selectedSubsidiary || isMappingsLoading;

  const onSubmit = async (data: SettingsFormValues) => {
    if (!integrationId) { toast.error("Integration ID is missing."); return; }
    setIsSubmitting(true);
    try {
      const payload = {
        integrationId,
        action: 'analyze',
        subsidiary: data.subsidiary,
      };
      const response = await apiPost('/api/file-format-config', payload); 
      let responseData = response.data;
      if (Array.isArray(responseData) && responseData.length > 0) responseData = responseData[0];

      if (responseData.status === 'success') {
        toast.success('Analysis successful! Proceeding to next step.');
        onNext(responseData);
      } else {
        throw new Error(responseData.message || 'Failed to analyze file structure.');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>General Settings</CardTitle><CardDescription>Select the main subsidiary for this integration before proceeding.</CardDescription></CardHeader>
          <CardContent>
            {/* ... El resto del JSX del formulario no cambia ... */}
            <Tabs defaultValue="common">
              <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="common">Common Settings</TabsTrigger><TabsTrigger value="accounting">Accounting Options</TabsTrigger><TabsTrigger value="segmentation">Segmentation</TabsTrigger></TabsList>
              <TabsContent value="common" className="mt-6 space-y-8">
                 <FormField control={form.control} name="subsidiary" render={({ field }) => ( 
                    <FormItem>
                      <FormLabel>Subsidiary</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubsidiaryLoading}>
                        <FormControl><SelectTrigger><SelectValue placeholder={isSubsidiaryLoading ? "Loading..." : "Select a subsidiary..."} /></SelectTrigger></FormControl>
                        <SelectContent>{subsidiaries.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                 )} />
                <FormField control={form.control} name="salesPostingMethod" render={({ field }) => ( <FormItem className="space-y-3"><FormLabel>Sales Posting Method</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-row space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="journalEntry" disabled={isDisabled} /></FormControl><FormLabel className="font-normal">Journal Entry</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="itemizedInvoice" disabled={isDisabled} /></FormControl><FormLabel className="font-normal">Itemized Invoice</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="batchClearingAccount" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel htmlFor="batch-clearing-account">Batch Clearing Account</FormLabel><FormControl><ReactSelectCombobox id="batch-clearing-account" options={accountOptions} value={field.value} onChange={field.onChange} placeholder={isMappingsLoading ? "Loading..." : "Select an account..."} searchPlaceholder="Search account..." emptyPlaceholder="No account found." disabled={isDisabled} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="includeZeroSalesLines" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Include Zero Sales Lines</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isDisabled} /></FormControl></FormItem>)} />
              </TabsContent>
              <TabsContent value="accounting" className="mt-6 space-y-8">
                <FormField control={form.control} name="inventorySync" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Activar Sincronización de Inventario</FormLabel><FormDescription>Crea Ajustes de Inventario en NetSuite basados en las recetas (BOMs) de los artículos vendidos.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isDisabled} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="salesSummaryLevel" render={({ field }) => ( <FormItem><FormLabel>Nivel de Resumen de Ventas</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={isDisabled}><FormControl><SelectTrigger><SelectValue placeholder="Select a summary level..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="category">Agrupar por Categoría de Venta / Major Group</SelectItem><SelectItem value="revenueCenter">Agrupar por Revenue Center</SelectItem><SelectItem value="sku">Detallar por Ítem / SKU</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="overShortHandling" render={({ field }) => ( <FormItem><FormLabel>Manejo de Faltantes/Sobrantes de Caja (Over/Short)</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={isDisabled}><FormControl><SelectTrigger><SelectValue placeholder="Select a handling method..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="ignore">No registrar (ignorar diferencias)</SelectItem><SelectItem value="singleLine">Registrar en una sola línea de asiento</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                {overShortValue === 'singleLine' && ( <FormField control={form.control} name="overShortAccount" render={({ field }) => ( <FormItem className="pl-4 border-l-2 ml-2 flex flex-col"><FormLabel htmlFor="over-short-account">Cuenta para Faltantes/Sobrantes</FormLabel><FormControl><ReactSelectCombobox id="over-short-account" options={accountOptions} value={field.value} onChange={field.onChange} placeholder={isMappingsLoading ? "Loading..." : "Select an account..."} searchPlaceholder="Search account..." emptyPlaceholder="No account found." disabled={isDisabled}/></FormControl><FormMessage /></FormItem>)} /> )}
                <FormField control={form.control} name="giftCardLiabilityAccount" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel htmlFor="gift-card-account">Cuenta de Pasivo para Venta de Tarjetas de Regalo</FormLabel><FormControl><ReactSelectCombobox id="gift-card-account" options={accountOptions} value={field.value} onChange={field.onChange} placeholder={isMappingsLoading ? "Loading..." : "Select an account..."} searchPlaceholder="Search account..." emptyPlaceholder="No account found." disabled={isDisabled} /></FormControl><FormMessage /></FormItem>)} />
              </TabsContent>
              <TabsContent value="segmentation" className="mt-6 space-y-8">
                <FormField control={form.control} name="defaultClass" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel htmlFor="default-class">Clase por Defecto para la Transacción</FormLabel><FormControl><ReactSelectCombobox id="default-class" options={classOptions} value={field.value} onChange={field.onChange} placeholder={isMappingsLoading ? "Loading..." : "Select a class..."} searchPlaceholder="Search class..." emptyPlaceholder="No class found." disabled={isDisabled} /></FormControl><FormDescription>Esta clase se aplicará a todas las líneas de la transacción por defecto.</FormDescription><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="defaultDepartment" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel htmlFor="default-department">Departamento por Defecto para la Transacción</FormLabel><FormControl><ReactSelectCombobox id="default-department" options={departmentOptions} value={field.value} onChange={field.onChange} placeholder={isMappingsLoading ? "Loading..." : "Select a department..."} searchPlaceholder="Search department..." emptyPlaceholder="No department found." disabled={isDisabled} /></FormControl><FormDescription>Este departamento se aplicará a todas las líneas de la transacción por defecto.</FormDescription><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="locationSource" render={({ field }) => ( <FormItem><FormLabel>Fuente para la Dimensión 'Ubicación' de NetSuite</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={isDisabled}><FormControl><SelectTrigger><SelectValue placeholder="Select a source..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="subsidiaryDefault">Usar la Ubicación por Defecto de la Subsidiaria</SelectItem><SelectItem value="mapFromRevenueCenter">Mapear desde el 'Revenue Center' del POS</SelectItem></SelectContent></Select><FormDescription>Elige si la Ubicación de NetSuite debe ser fija o mapeada dinámicamente desde el POS.</FormDescription><FormMessage /></FormItem>)} />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>Back</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze File & Next
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
