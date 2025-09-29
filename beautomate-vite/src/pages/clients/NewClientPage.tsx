import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { apiPost } from '@/lib/api'; // Import our new API service

const clientFormSchema = z.object({
  razon_social: z.string().min(1, 'La razón social es requerida'),
  contactPerson: z.string().min(1, 'La persona de contacto es requerida'),
  contactEmail: z.string().email('Correo electrónico inválido'),
  periodo_facturacion: z.enum(['Mensual', 'Anual']),
  fecha_renovacion: z.date({
    required_error: "La fecha de renovación es requerida.",
  }),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function NewClientPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      razon_social: '',
      contactPerson: '',
      contactEmail: '',
    },
  });

  async function onSubmit(values: ClientFormValues) {
    setIsSubmitting(true);
    
    const payload = {
      data: [
        {
          clientName: values.razon_social,
          clientContact_Name: values.contactPerson,
          ...values,
        },
      ],
    };

    try {
      // Use the new apiPost function
      const response = await apiPost('/clients', payload);
      console.log('Respuesta del servidor:', response.data);

      if (response.data.status === 'true') {
        toast.success('Cliente creado exitosamente');
        form.reset();
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else if (response.data.status === 'fail') {
        toast.error('El cliente ya existe.');
      } else {
        toast.error('Ocurrió un error al crear el cliente.');
      }
    } catch (error: any) {
      console.error('Error al crear el cliente:', error);
      toast.error(error.message || 'Ocurrió un error al crear el cliente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Clientes
          </Link>
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Crear un Nuevo Cliente</CardTitle>
          <CardDescription>Complete el siguiente formulario para agregar un nuevo cliente al sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="razon_social"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón Social</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Global Food Corp" {...field} />
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
                    <FormLabel>Persona de Contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Pérez" {...field} />
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
                    <FormLabel>Correo Electrónico de Contacto</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Ej: juan.perez@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="periodo_facturacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodo de Facturación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un periodo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mensual">Mensual</SelectItem>
                        <SelectItem value="Anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fecha_renovacion"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Renovación</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Seleccione una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Cliente
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
