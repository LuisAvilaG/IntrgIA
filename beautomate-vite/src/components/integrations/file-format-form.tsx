'use client';

import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiPost } from '@/lib/api';
import { Loader2 } from 'lucide-react';

// ... (Esquemas de Zod sin cambios)
const fieldSchema = z.object({
  use: z.boolean(),
  standardName: z.string(),
  position: z.coerce.number().min(1, "Posición debe ser 1 o mayor."),
  fileName: z.string().optional(),
});
const recordTypeSchema = z.object({
  active: z.boolean(),
  fields: z.array(fieldSchema),
});
const parserConfigSchema = z.object({
  recordTypes: z.record(recordTypeSchema),
});
type FormValues = z.infer<typeof parserConfigSchema>;


interface FileFormatFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  integrationId: string | null;
  analysisData: any; // Recibe los datos del análisis como prop
  initialData?: any;
}

export default function FileFormatForm({ onNext, onBack, integrationId, analysisData, initialData }: FileFormatFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(parserConfigSchema),
    defaultValues: initialData || { recordTypes: {} },
  });
  
  const watchedRecordTypes = useWatch({ control: form.control, name: 'recordTypes' });

  // **LÓGICA SIMPLIFICADA:** Ya no hace una llamada a la API, solo usa los datos recibidos.
  useEffect(() => {
    if (analysisData && analysisData.detectedRecordTypes) {
      const initialFormState: any = {};
      analysisData.detectedRecordTypes.forEach((type: string) => {
        const templateFields = analysisData.standardFormatTemplates[type] || [];
        initialFormState[type] = {
          active: true,
          fields: templateFields.map((field: any) => ({
            use: field.use,
            standardName: field.standardName,
            position: field.defaultPosition,
            fileName: field.defaultName,
          }))
        };
      });
      form.reset({ recordTypes: initialFormState });
    } else if (!initialData) {
        // Si no hay datos de análisis ni datos iniciales, mostramos un error.
        toast.error("No analysis data found. Please go back to the Settings step.");
    }
  }, [analysisData, initialData, form.reset]);

  const onSubmit = async (data: FormValues) => {
    if (!integrationId) { toast.error("Integration ID is missing."); return; }
    setIsSubmitting(true);
    try {
        const activeRecordTypes = Object.fromEntries(
          Object.entries(data.recordTypes).filter(([_, config]) => config.active)
        );

        const payload = {
            integrationId,
            action: 'save', // La acción de este formulario siempre es 'save'
            parserConfig: activeRecordTypes,
        };
        const response = await apiPost('/api/file-format-config', payload);
        let responseData = response.data;
        if (Array.isArray(responseData) && responseData.length > 0) responseData = responseData[0];

        if (responseData.status === 'success') {
            toast.success(responseData.message || "File format configuration saved!");
            onNext(data);
        } else {
            throw new Error(responseData.message || "Failed to save configuration.");
        }
    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!analysisData) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Waiting for analysis data...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Definición del Formato de Archivo</CardTitle>
            <CardDescription>Valida la estructura de los registros detectados en tu archivo. Ajusta las posiciones si tu formato es personalizado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>Tipos de Registro Detectados</Label>
                <div className="flex flex-wrap gap-4 rounded-lg border p-4">
                    {Array.isArray(analysisData?.detectedRecordTypes) && analysisData.detectedRecordTypes.map((type: string) => (
                        <FormField
                            key={type}
                            control={form.control}
                            name={`recordTypes.${type}.active`}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <FormLabel className="font-normal">{type}</FormLabel>
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
            </div>

            {Object.keys(watchedRecordTypes || {}).filter(type => watchedRecordTypes[type]?.active).map((type) => (
                <div key={type} className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold text-lg">Configuración del Registro '{type}'</h3>
                    <RecordTypeTable control={form.control} type={type} />
                </div>
            ))}
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

// ... (Componente RecordTypeTable sin cambios)
function RecordTypeTable({ control, type }: { control: Control<FormValues>, type: string }) {
    const { fields } = useFieldArray({ control, name: `recordTypes.${type}.fields` });
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px]">Usar</TableHead>
                    <TableHead>Nombre del Campo Estándar</TableHead>
                    <TableHead className="w-[120px]">Posición</TableHead>
                    <TableHead>Nombre en Archivo (Opcional)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {fields.map((field, index) => (
                    <TableRow key={field.id}>
                        <TableCell><FormField control={control} name={`recordTypes.${type}.fields.${index}.use`} render={({ field }) => (<FormItem><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} /></TableCell>
                        <TableCell><FormField control={control} name={`recordTypes.${type}.fields.${index}.standardName`} render={({ field }) => (<FormItem><FormLabel className="font-normal">{field.value}</FormLabel></FormItem>)} /></TableCell>
                        <TableCell><FormField control={control} name={`recordTypes.${type}.fields.${index}.position`} render={({ field }) => (<FormItem><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} /></TableCell>
                        <TableCell><FormField control={control} name={`recordTypes.${type}.fields.${index}.fileName`} render={({ field }) => (<FormItem><FormControl><Input {...field} /></FormControl></FormItem>)} /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
