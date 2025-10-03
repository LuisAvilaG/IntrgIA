'use client';

import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CircleHelp, Trash2, FileText, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { apiPost } from '@/lib/api';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const restaurantSchema = z.object({
  name: z.string().min(1, "El nombre del restaurante es obligatorio."),
  placeholders: z.record(z.string().min(1, "Este campo es obligatorio.")),
});

const sftpConfigSchema = z.object({
  processingMode: z.enum(['perRestaurant', 'allInFolder']),
  fullPathPattern: z.string().min(1, "El patrón es obligatorio."),
  fileExtension: z.string().min(1, "La extensión es obligatoria."),
  restaurants: z.array(restaurantSchema),
}).superRefine((data, ctx) => {
    if (data.processingMode === 'perRestaurant' && data.restaurants.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['restaurants'], message: 'Se requiere al menos un restaurante en este modo.' });
    }
});

type FormValues = z.infer<typeof sftpConfigSchema>;

const formatPlaceholderLabel = (placeholder: string): string => placeholder.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
const IGNORED_PLACEHOLDERS = ['MMDDYY', 'YYYYMMDD', 'DDMMYYYY'];

interface FileNamePreviewProps { control: Control<FormValues>; index: number; pattern: string; extension: string; }
const FileNamePreview = ({ control, index, pattern, extension }: FileNamePreviewProps) => {
    const restaurantValues = useWatch({ control, name: `restaurants.${index}` });
    const generatedPreview = useMemo(() => {
        let preview = pattern || '';
        const today = new Date();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const yy = String(today.getFullYear()).slice(-2);
        const yyyy = today.getFullYear();
        preview = preview.replace(/<DDMMYYYY>/ig, `${dd}${mm}${yyyy}`);
        preview = preview.replace(/<MMDDYY>/ig, `${mm}${dd}${yy}`);
        preview = preview.replace(/<YYYYMMDD>/ig, `${yyyy}${mm}${dd}`);
        if (restaurantValues.placeholders) {
            for (const key in restaurantValues.placeholders) {
                const value = restaurantValues.placeholders[key] || `<${key}>`;
                preview = preview.replace(new RegExp(`<${key}>`, 'g'), value);
            }
        }
        return `${preview}.${extension || ''}`;
    }, [pattern, extension, restaurantValues]);
    return ( <div className="mt-4 p-3 bg-muted rounded-md flex items-center gap-3"><FileText className="h-5 w-5 shrink-0 text-muted-foreground" /><p className="text-sm text-muted-foreground break-all"><span className="font-semibold text-foreground">Vista Previa:</span> {generatedPreview}</p></div> );
};

interface SftpFileConfigFormProps {
  onNext: (data: FormValues) => void;
  onBack: () => void;
  integrationId: string | null;
  initialData?: FormValues | null;
}

export default function SftpFileConfigForm({ onNext, onBack, integrationId, initialData }: SftpFileConfigFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(sftpConfigSchema),
    defaultValues: initialData || {
      processingMode: 'perRestaurant',
      fullPathPattern: '/directorio/GLExport_<StoreNumber>_<DDMMYYYY>',
      fileExtension: 'txt',
      restaurants: [{ name: '', placeholders: {} }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({ control: form.control, name: "restaurants" });
  const { fullPathPattern, fileExtension, processingMode } = useWatch({ control: form.control });

  const dynamicPlaceholders = useMemo(() => {
    const pattern = fullPathPattern || '';
    const matches = pattern.match(/<([^>]+)>/g) || [];
    return matches.map(p => p.substring(1, p.length - 1)).filter(p => !IGNORED_PLACEHOLDERS.includes(p.toUpperCase()));
  }, [fullPathPattern]);

  useEffect(() => {
    fields.forEach((_, index) => {
      const currentPlaceholders = form.getValues(`restaurants.${index}.placeholders`) || {};
      const newPlaceholders: { [key: string]: string } = {};
      dynamicPlaceholders.forEach(p => { newPlaceholders[p] = currentPlaceholders[p] || ''; });
      form.setValue(`restaurants.${index}.placeholders`, newPlaceholders);
    });
  }, [dynamicPlaceholders, fields, form]);

  // **LA CORRECCIÓN:** Sincronizar el estado del formulario con el modo de procesamiento.
  useEffect(() => {
    if (processingMode === 'allInFolder') {
        // Si el modo es 'allInFolder', vaciamos el array de restaurantes para que pase la validación.
        replace([]); // 'replace' es la forma recomendada por react-hook-form para manejar esto.
    } else if (processingMode === 'perRestaurant' && fields.length === 0) {
        // Si el modo es 'perRestaurant' y no hay restaurantes, añadimos uno por defecto.
        append({ name: '', placeholders: {} });
    }
  }, [processingMode, fields.length, append, replace]);


  const onSubmit = async (data: FormValues) => {
    if (!integrationId) { toast.error("Integration ID is missing."); return; }
    setIsSubmitting(true);
    try {
        const payload = {
            integrationId,
            processingMode: data.processingMode,
            fullPathPattern: data.fullPathPattern,
            fileExtension: data.fileExtension,
            restaurants: data.processingMode === 'perRestaurant' ? data.restaurants.map(r => ({ name: r.name, placeholders: r.placeholders })) : [],
        };
        const response = await apiPost('/api/sftp-config', payload);
        let responseData = response.data;
        if (Array.isArray(responseData) && responseData.length > 0) { responseData = responseData[0]; }

        if (responseData.status === 'success') {
            toast.success(responseData.message || "Configuración SFTP guardada!");
            onNext(data);
        } else {
            throw new Error(responseData.message || "No se pudo guardar la configuración SFTP.");
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
          <CardHeader><CardTitle>Configuración de Archivos SFTP</CardTitle><CardDescription>Define cómo encontrar e identificar los archivos de ventas en el servidor.</CardDescription></CardHeader>
          <CardContent className="space-y-8">
            <FormField control={form.control} name="processingMode" render={({ field }) => ( <FormItem className="space-y-3"><FormLabel>Modo de Procesamiento</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"><FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="perRestaurant" /></FormControl><FormLabel className="font-normal">Un Archivo por Restaurante</FormLabel></FormItem><FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="allInFolder" /></FormControl><FormLabel className="font-normal">Todos los Archivos en una Carpeta</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem> )} />
            
            <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <FormField control={form.control} name="fullPathPattern" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2">{processingMode === 'perRestaurant' ? 'Patrón de Ruta y Nombre de Archivo' : 'Patrón de Ruta de la Carpeta'}<TooltipProvider><Tooltip><TooltipTrigger asChild><CircleHelp className="h-4 w-4 text-muted-foreground" /></TooltipTrigger><TooltipContent className="w-80">{processingMode === 'perRestaurant' ? (<><p className="font-bold">Define ruta y nombre, sin extensión.</p><p>Usa marcadores dinámicos <code className="bg-muted px-1 rounded">&lt;&gt;</code>.</p><p className="mt-2"><b>Ejemplo:</b> /ventas/&lt;StoreFolder&gt;/&lt;DDMMYYYY&gt;</p></>) : (<><p className="font-bold">Define la ruta a la carpeta.</p><p>Puedes usar marcadores de fecha.</p><p className="mt-2"><b>Ejemplo:</b> /Netsuite/Data/&lt;DDMMYYYY&gt;/</p></>)}</TooltipContent></Tooltip></TooltipProvider></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                    <div>
                        <FormField control={form.control} name="fileExtension" render={({ field }) => ( <FormItem><FormLabel>Extensión del Archivo</FormLabel><FormControl><Input {...field} placeholder="Ej: txt, csv" /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                </div>
                <FormDescription className="mt-2 text-xs text-muted-foreground">
                    {processingMode === 'perRestaurant' ? 'Cualquier texto en < > que no sea una fecha, se convertirá en un campo dinámico.' : 'El sistema procesará todos los archivos con la extensión indicada en esta carpeta.'}
                </FormDescription>
            </div>

            {processingMode === 'perRestaurant' && (
                <div className="space-y-4">
                <Label>Valores por Restaurante</Label>
                <div className="space-y-6">
                    {fields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border p-4 space-y-4">
                        <div className="flex items-center justify-between"><Label className="text-lg">Restaurante #{index + 1}</Label>{fields.length > 1 && ( <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Eliminar</span></Button> )}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`restaurants.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Nombre del Restaurante</FormLabel><FormControl><Input {...field} placeholder="Ej: Restaurante Principal" /></FormControl><FormMessage /></FormItem>)} />
                        {dynamicPlaceholders.map(placeholder => ( <FormField key={placeholder} control={form.control} name={`restaurants.${index}.placeholders.${placeholder}`} render={({ field }) => (<FormItem><FormLabel>{formatPlaceholderLabel(placeholder)}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /> ))}
                        </div>
                        <FileNamePreview control={form.control} index={index} pattern={fullPathPattern} extension={fileExtension} />
                    </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => append({ name: '', placeholders: {} })}>+ Añadir Restaurante</Button>
                </div>
                </div>
            )}
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>Atrás</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar y Continuar
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
