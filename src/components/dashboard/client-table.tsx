import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { clients } from '@/lib/data';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export default function ClientTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client Name</TableHead>
          <TableHead>Active Integrations</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>{client.activeIntegrations}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  client.healthStatus === 'good'
                    ? 'border-green-500 text-green-500'
                    : 'border-red-500 text-red-500'
                )}
              >
                {client.healthStatus === 'good' ? 'Healthy' : 'Needs Attention'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                     <Link href={`/clients/${client.id}`}>Manage Client</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>View Invoices</DropdownMenuItem>
                   <DropdownMenuItem className="text-red-500 hover:!text-red-500">Delete Client</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
