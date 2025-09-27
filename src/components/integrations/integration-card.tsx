import Link from 'next/link';
import type { Integration } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowRight, Play, Pause, Trash2, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NetSuiteLogo, SimphonyLogo, ToastLogo } from '../icons';
import { format, formatDistanceToNow } from 'date-fns';

const LOGO_MAP = {
  simphony: SimphonyLogo,
  netsuite: NetSuiteLogo,
  toast: ToastLogo,
};

export default function IntegrationCard({ integration }: { integration: Integration }) {
  const FromLogo = LOGO_MAP[integration.from as keyof typeof LOGO_MAP] || 'div';
  const ToLogo = LOGO_MAP[integration.to as keyof typeof LOGO_MAP] || 'div';

  const lastSyncDate = new Date(integration.lastSync.date);

  return (
    <Card className="flex flex-col hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-4">
            <FromLogo className="h-6" />
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <ToLogo className="h-6" />
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                 <Link href={`/clients/${integration.clientId}/integrations/${integration.id}/settings`}><Settings className="mr-2 h-4 w-4"/> Edit Configuration</Link>
              </DropdownMenuItem>
              <DropdownMenuItem><FileText className="mr-2 h-4 w-4"/> View Logs</DropdownMenuItem>
              <DropdownMenuSeparator />
               {integration.status === 'active' ? (
                 <DropdownMenuItem><Pause className="mr-2 h-4 w-4"/> Pause</DropdownMenuItem>
               ) : (
                <DropdownMenuItem><Play className="mr-2 h-4 w-4"/> Resume</DropdownMenuItem>
               )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 hover:!text-red-500">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>
          <Badge
            variant="outline"
            className={cn(
              'capitalize',
              integration.status === 'active'
                ? 'border-green-500 text-green-500'
                : 'border-gray-500 text-gray-500'
            )}
          >
            {integration.status}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Last Sync:</span>
          <span
            className={cn(
              integration.lastSync.status === 'success' ? 'text-green-400' : 'text-red-400'
            )}
          >
            {formatDistanceToNow(lastSyncDate, { addSuffix: true })} - {integration.lastSync.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Next Sync:</span>
          <span>
            {integration.status === 'active' ? format(new Date(integration.nextSync), "MMM d, h:mm a") : 'N/A'}
            </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full" asChild>
           <Link href={`/clients/${integration.clientId}/integrations/${integration.id}/settings`}>
            Manage Integration
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
