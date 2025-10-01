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
import { Combobox } from '../ui/combobox'; // Importamos el nuevo componente

type SelectOption = { id: string; name: string; };
// Tipo compatible con el nuevo Combobox
type ComboboxOption = { value: string; label: string; };

const settingsSchema = z.object({
  subsidiary: z.string().min(1, "Subsidiary is required"),
  salesPostingMethod: z.enum(['journalEntry', 'itemizedInvoice']),
  batchClearingAccount: z.string().min(1, "Account is required"),
  includeZeroSalesLines: z.boolean(),
  memo: z.enum(['posDate', 'storeDate', 'location', 'locationId', 'custom']),
  inventorySync: z.boolean(),
  salesSummaryLevel: z.enum(['category', 'revenueCenter', 'sku']),
  overShortHandling: z.enum(['ignore', 'singleLine']),
  overShortAccount: z.string().optional(),
  giftCardLiabilityAccount: z.string().min(1, "Gift Card account is required"),
  defaultClass: z.string().min(1, "Default Class is required"),
  defaultDepartment: z.string().min(1, "Default Department is required"),
  locationSource: z.enum(['subsidiaryDefault', 'mapFromRevenueCenter']),
}).refine(data => {
    if (data.overShortHandling === 'singleLine') return data.overShortAccount && data.overShortAccount.length > 0;
    return true;
}, { message: "An account must be selected for Over/Short handling.", path: ["overShortAccount"] });

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  onNext: () => void;
  onBack: () => void;
  settings: Partial<SettingsFormValues>;
  integrationId: string | null;
}

export default function SettingsForm({ onNext, onBack, settings, integrationId }: SettingsFormProps) {
  const [isSubsidiaryLoading, setIsSubsidiaryLoading] = useState(true);
  const [isMappingsLoading, setIsMappingsLoading] = useState(false);
  const [subsidiaries, setSubsidiaries] = useState<SelectOption[]>([]);
  const [discoveredData, setDiscoveredData] = useState<any>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { ...settings, subsidiary: settings.subsidiary ?? '' },
  });

  const selectedSubsidiary = useWatch({ control: form.control, name: 'subsidiary' });

  useEffect(() => { /* ... (código de fetchSubsidiaries sin cambios) ... */
    const controller = new AbortController();
    const fetchSubsidiaries = async () => {
      if (!integrationId) { toast.error("Integration ID missing."); setIsSubsidiaryLoading(false); return; }
      try {
        const response = await apiPost('/api/discover-subsidiaries', { integrationId }, controller.signal);
        let responseData = response.data;
        if (Array.isArray(responseData) && responseData.length > 0) { responseData = responseData[0]; }
        if (responseData.status === 'success' && responseData.data?.subsidiaries) {
          setSubsidiaries(responseData.data.subsidiaries);
        } else { throw new Error(responseData.message || 'Failed to fetch subsidiaries.'); }
      } catch (error: any) {
        if (!axios.isCancel(error)) { toast.error(`Failed to load subsidiaries: ${error.message}`); }
      } finally { setIsSubsidiaryLoading(false); }
    };
    fetchSubsidiaries();
    return () => { controller.abort(); };
  }, [integrationId]);

  useEffect(() => { /* ... (código de fetchMappings sin cambios) ... */
    if (!selectedSubsidiary) return;
    const controller = new AbortController();
    const fetchMappings = async () => {
      setIsMappingsLoading(true); setDiscoveredData(null);
      try {
        const response = await apiPost('/api/discover-mappings', { integrationId, subsidiaryId: selectedSubsidiary }, controller.signal);
        let responseData = response.data;
        if (Array.isArray(responseData) && responseData.length > 0) { responseData = responseData[0]; }
        if (responseData.status === 'success' && responseData.data?.netsuite) {
          setDiscoveredData(responseData.data.netsuite);
        } else { throw new Error(responseData.message || 'Failed to fetch mapping data.'); }
      } catch (error: any) {
         if (!axios.isCancel(error)) { toast.error(`Failed to load mappings: ${error.message}`); }
      } finally { setIsMappingsLoading(false); }
    };
    fetchMappings();
    return () => { controller.abort(); };
  }, [selectedSubsidiary, integrationId]);

  // Transformamos los datos de la API al formato que espera el Combobox
  const transformToComboboxOptions = (items: SelectOption[] = []): ComboboxOption[] => {
    return items.map(item => ({ value: item.id, label: item.name }));
  };

  const accountOptions = useMemo(() => transformToComboboxOptions(discoveredData?.accounts), [discoveredData]);
  const classOptions = useMemo(() => transformToComboboxOptions(discoveredData?.classes), [discoveredData]);
  const departmentOptions = useMemo(() => transformToComboboxOptions(discoveredData?.departments), [discoveredData]);

  const overShortValue = form.watch('overShortHandling');
  const isFormDisabled = !selectedSubsidiary || isMappingsLoading;

  const onSubmit = (data: SettingsFormValues) => {
    console.log(data);
    toast.success("Settings have been validated!");
    onNext();
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>General Settings</CardTitle><CardDescription>Define the high-level rules for how accounting entries are created.</CardDescription></CardHeader>
          <CardContent>
            <Tabs defaultValue="common">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="common">Common Settings</TabsTrigger>
                <TabsTrigger value="accounting">Accounting Options</TabsTrigger>
                <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="common" className="mt-6 space-y-8">
                 <FormField control={form.control} name="subsidiary" render={({ field }) => ( 
                    <FormItem>
                      <FormLabel>Subsidiary</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubsidiaryLoading}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={isSubsidiaryLoading ? "Loading subsidiaries..." : "Select a subsidiary..."} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>{subsidiaries.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                 )} />

                <fieldset disabled={isFormDisabled} className="space-y-8 disabled:opacity-50">
                    <FormField control={form.control} name="salesPostingMethod" render={({ field }) => ( <FormItem className="space-y-3"><FormLabel>Sales Posting Method</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-row space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="journalEntry" /></FormControl><FormLabel className="font-normal">Journal Entry</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="itemizedInvoice" /></FormControl><FormLabel className="font-normal">Itemized Invoice</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                    
                    {/* Reemplazado con Combobox */}
                    <FormField control={form.control} name="batchClearingAccount" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Batch Clearing Account</FormLabel><FormControl><Combobox options={accountOptions} value={field.value} onChange={field.onChange} placeholder={isMappingsLoading ? "Loading..." : "Select an account..."} searchPlaceholder="Search account..." emptyPlaceholder="No account found." /></FormControl><FormMessage /></FormItem>)} />
                    
                    <FormField control={form.control} name="includeZeroSalesLines" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Include Zero Sales Lines</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                </fieldset>
              </TabsContent>
              
              <TabsContent value="accounting" className="mt-6 space-y-8">
                <fieldset disabled={isFormDisabled} className="space-y-8 disabled:opacity-50">
                    <FormField control={form.control} name="inventorySync" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Activar Sincronización de Inventario</FormLabel><FormDescription>Crea Ajustes de Inventario en NetSuite basados en las recetas (BOMs) de los artículos vendidos.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="salesSummaryLevel" render={({ field }) => ( <FormItem><FormLabel>Nivel de Resumen de Ventas</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a summary level..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="category">Agrupar por Categoría de Venta / Major Group</SelectItem><SelectItem value="revenueCenter">Agrupar por Revenue Center</SelectItem><SelectItem value="sku">Detallar por Ítem / SKU</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="overShortHandling" render={({ field }) => ( <FormItem><FormLabel>Manejo de Faltantes/Sobrantes de Caja (Over/Short)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a handling method..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="ignore">No registrar (ignorar diferencias)</SelectItem><SelectItem value="singleLine">Registrar en una sola línea de asiento</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    
                    {/* Reemplazado con Combobox */}
                    {overShortValue === 'singleLine' && ( <FormField control={form.control} name="overShortAccount" render={({ field }) => ( <FormItem className="pl-4 border-l-2 ml-2 flex flex-col"><FormLabel>Cuenta para Faltantes/Sobrantes</FormLabel><FormControl><Combobox options={accountOptions} value={field.value} onChange={field.onChange} placeholder={isMappingsLoading ? "Loading..." : "Select an account..."} searchPlaceholder="Search account..." emptyPlaceholder="No account found."/></FormControl><FormMessage /></FormItem>)} /> )}
                    <FormField control={form.control} name="giftCardLiabilityAccount" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Cuenta de Pasivo para Venta de Tarjetas de Regalo</FormLabel><FormControl><Combobox options={accountOptions} value={field.value} onChange={field.onChange} placeholder={isMappingsLoading ? "Loading..." : "Select an account..."} searchPlaceholder="Search account..." emptyPlaceholder="No account found."/></FormControl><FormMessage /></FormItem>)} />
                </fieldset>
              </TabsContent>

              <TabsContent value="segmentation" className="mt-6 space-y-8">
                 <fieldset disabled={isFormDisabled} className="space-y-8 disabled:opacity-50">
                    {/* Reemplazado con Combobox */}
                    <FormField control={form.control} name="defaultClass" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Clase por Defecto para la Transacción</FormLabel><FormControl><Combobox options={classOptions} value={field.value} onChange={field.onChange} placeholder={isMappingsLoading ? "Loading..." : "Select a class..."} searchPlaceholder="Search class..." emptyPlaceholder="No class found." /></FormControl><FormDescription>Esta clase se aplicará a todas las líneas de la transacción por defecto.</FormDescription><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="defaultDepartment" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Departamento por Defecto para la Transacción</FormLabel><FormControl><Combobox options={departmentOptions} value={field.value} onChange={field.onChange} placeholder={isMappingsLoading ? "Loading..." : "Select a department..."} searchPlaceholder="Search department..." emptyPlaceholder="No department found." /></FormControl><FormDescription>Este departamento se aplicará a todas las líneas de la transacción por defecto.</FormDescription><FormMessage /></FormItem>)} />
                    
                    <FormField control={form.control} name="locationSource" render={({ field }) => ( <FormItem><FormLabel>Fuente para la Dimensión 'Ubicación' de NetSuite</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a source..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="subsidiaryDefault">Usar la Ubicación por Defecto de la Subsidiaria</SelectItem><SelectItem value="mapFromRevenueCenter">Mapear desde el 'Revenue Center' del POS</SelectItem></SelectContent></Select><FormDescription>Elige si la Ubicación de NetSuite debe ser fija o mapeada dinámicamente desde el POS.</FormDescription><FormMessage /></FormItem>)} />
                 </fieldset>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-end gap-2"><Button type="button" variant="outline" onClick={onBack}>Back</Button><Button type="submit">Save & Next</Button></CardFooter>
        </Card>
      </form>
    </Form>
  );
}
