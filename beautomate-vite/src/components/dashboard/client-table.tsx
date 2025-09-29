"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "./data-table"
import { Client } from "@/lib/definitions"
import { format } from 'date-fns';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useNavigate } from "react-router-dom"

// We define the columns as a function that can accept the navigate function
const getColumns = (navigate: (path: string) => void): ColumnDef<Client>[] => [
  {
    accessorKey: "clientName",
    header: "Nombre del Cliente",
  },
  {
    accessorKey: "clientContact_name",
    header: "Contacto",
  },
  {
    accessorKey: "clientContact_email",
    header: "Email",
  },
  {
    accessorKey: "PeriodoDeFacturacion",
    header: "Facturación",
  },
  {
    accessorKey: "FechaDeRenovacion",
    header: "Renovación",
    cell: ({ row }) => {
      const date = row.getValue("FechaDeRenovacion") as string;
      if (!date) return null;
      return format(new Date(date), 'dd/MM/yyyy');
    },
  },
  {
    accessorKey: "integrationCount",
    header: "Nº de Integraciones",
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("integrationCount")}</div>
    }
  },
  {
    accessorKey: "status",
    header: "Estatus",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const isActive = status === 'Active'
      const variant = isActive ? "default" : "destructive"
      return <Badge variant={variant}>{isActive ? 'Activo' : 'Inactivo'}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              Ver Integraciones
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Ver facturación de:", client.clientName)}
            >
              Facturación
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => console.log("Modificar cliente:", client.clientName)}
            >
              Modificar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => console.log("Eliminar cliente:", client.clientName)}
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface ClientTableProps {
  clients: Client[];
}

export default function ClientTable({ clients }: ClientTableProps) {
  const navigate = useNavigate();
  const columns = React.useMemo(() => getColumns(navigate), [navigate]);

  const processedClients = clients.map(client => ({
    ...client,
    integrationCount: client.integrationCount || 0,
    status: client.status || 'Active',
  }));

  return (
    <DataTable columns={columns} data={processedClients} />
  )
}
