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
import { CircleHelp, Trash2, FileText } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

// Esquema de validación para el formulario (traducido)
const restaurantSchema = z.object({
  name: z.string().min(1, "El nombre del restaurante es obligatorio."),
  path: z.string().min(1, "La ruta de la carpeta es obligatoria."),
  placeholders: z.record(z.string().min(1, "Este campo es obligatorio.")),
});

const sftpConfigSchema = z.object({
  fileNamePattern: z.string().min(1, "El formato del nombre de archivo es obligatorio."),
  restaurants: z.array(restaurantSchema).min(1, "Se requiere al menos un restaurante."),
});

type FormValues = z.infer<typeof sftpConfigSchema>;

// Función para capitalizar y añadir espacios a los placeholders
const formatPlaceholderLabel = (placeholder: string): string => {
    return placeholder.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
};

const IGNORED_PLACEHOLDERS = ['MMDDYY', 'YYYYMMDD', 'DDMMYYYY'];

// --- NUEVO SUB-COMPONENTE PARA LA VISTA PREVIA EN TIEMPO REAL ---
interface FileNamePreviewProps {
    control: Control<FormValues>;
    index: number;
    pattern: string;
}

const FileNamePreview = ({ control, index, pattern }: FileNamePreviewProps) => {
    // Observa todos los valores del restaurante actual para reaccionar a los cambios
    const restaurantValues = useWatch({ control, name: `restaurants.${index}` });

    // Genera la vista previa del nombre del archivo
    const generatedPreview = useMemo(() => {
        let preview = pattern;

        // 1. Reemplazar placeholders de fecha con un ejemplo
        const today = new Date();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const yy = String(today.getFullYear()).slice(-2);
        preview = preview.replace(/<MMDDYY>/ig, `${mm}${dd}${yy}`);
        // (Se pueden añadir más formatos de fecha aquí si es necesario)

        // 2. Reemplazar placeholders dinámicos con los valores del formulario
        if (restaurantValues.placeholders) {
            for (const key in restaurantValues.placeholders) {
                // Si el campo está vacío, muestra el nombre del placeholder para que el usuario sepa qué falta
                const value = restaurantValues.placeholders[key] || `<${key}>`;
                preview = preview.replace(new RegExp(`<${key}>`, 'g'), value);
            }
        }
        
        return preview;
    }, [pattern, restaurantValues]);

    return (
        <div className="mt-4 p-3 bg-muted rounded-md flex items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground break-all">
                <span className="font-semibold text-foreground">Vista Previa:</span> {generatedPreview}
            </p>
        </div>
    );
};


interface SftpFileConfigFormProps {
  onNext: (data: FormValues) => void;
  onBack: () => void;
  integrationId: string | null;
  initialData?: FormValues | null;
}

export default function SftpFileConfigForm({ onNext, onBack, integrationId, initialData }: SftpFileConfigFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(sftpConfigSchema),
    defaultValues: initialData || {
      fileNamePattern: 'GLExport_<StoreNumber><MMDDYY>.txt',
      restaurants: [{ name: '', path: '', placeholders: {} }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "restaurants",
  });

  const fileNamePattern = useWatch({ control: form.control, name: 'fileNamePattern' });

  const dynamicPlaceholders = useMemo(() => {
    const matches = fileNamePattern.match(/<([^>]+)>/g) || [];
    return matches
      .map(p => p.substring(1, p.length - 1))
      .filter(p => !IGNORED_PLACEHOLDERS.includes(p.toUpperCase()));
  }, [fileNamePattern]);

  useEffect(() => {
    fields.forEach((_, index) => {
      const currentPlaceholders = form.getValues(`restaurants.${index}.placeholders`) || {};
      const newPlaceholders: { [key: string]: string } = {};
      dynamicPlaceholders.forEach(p => {
        newPlaceholders[p] = currentPlaceholders[p] || '';
      });
      form.setValue(`restaurants.${index}.placeholders`, newPlaceholders);
    });
  }, [dynamicPlaceholders, fields, form]);


  const onSubmit = (data: FormValues) => {
    console.log("Form Data Submitted:", data);
    toast.success("Configuración SFTP guardada!");
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Archivos SFTP</CardTitle>
            <CardDescription>Define cómo encontrar e identificar los archivos de ventas en el servidor SFTP.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <FormField
              control={form.control}
              name="fileNamePattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Formato del Nombre de Archivo
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild><CircleHelp className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent className="w-80">
                          <p className="font-bold">Define el patrón del nombre de archivo.</p>
                          <p>Usa marcadores de posición entre <code className="bg-muted px-1 rounded">&lt;&gt;</code>. Los reemplazaremos dinámicamente.</p>
                          <p className="mt-2"><b>Marcadores de Fecha (automáticos):</b> &lt;MMDDYY&gt;, &lt;YYYYMMDD&gt;</p>
                          <p><b>Ejemplos Dinámicos:</b> &lt;StoreNumber&gt;, &lt;LocationID&gt;, &lt;ClaseTienda&gt;</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormDescription>
                    Cualquier texto entre &lt; &gt; que no sea una fecha, se convertirá en un campo dinámico para cada restaurante.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <Label>Ubicaciones de Restaurantes</Label>
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg">Restaurante #{index + 1}</Label>
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Eliminar Restaurante</span>
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name={`restaurants.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Nombre del Restaurante</FormLabel><FormControl><Input {...field} placeholder="Ej: Restaurante Principal" /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`restaurants.${index}.path`} render={({ field }) => (<FormItem><FormLabel>Ruta de la Carpeta</FormLabel><FormControl><Input {...field} placeholder="/exports/rest_principal/" /></FormControl><FormMessage /></FormItem>)} />

                      {dynamicPlaceholders.map(placeholder => (
                        <FormField key={placeholder} control={form.control} name={`restaurants.${index}.placeholders.${placeholder}`} render={({ field }) => (<FormItem><FormLabel>{formatPlaceholderLabel(placeholder)}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      ))}
                    </div>
                    
                    {/* --- VISTA PREVIA EN TIEMPO REAL --- */}
                    <FileNamePreview control={form.control} index={index} pattern={fileNamePattern} />

                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append({ name: '', path: '', placeholders: {} })}>
                  + Añadir Restaurante
                </Button>
              </div>
            </div>

          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="outline" onClick={onBack}>Atrás</Button>
            <Button type="submit">Guardar y Continuar</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
