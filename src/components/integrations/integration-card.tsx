import Link from 'next/link';
import type { Integration } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowRight, Play, Pause, Trash2, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { format, formatDistanceToNow } from 'date-fns';

const LOGO_MAP: { [key: string]: string } = {
  simphony: '/logos/simphony.png',
  netsuite: '/logos/netsuite.png',
  shopify: '/logos/shopify.png',
  toast: '/logos/toast.png',
};

export default function IntegrationCard({ integration }: { integration: Integration }) {
  const fromLogoSrc = LOGO_MAP[integration.from.toLowerCase()] || '/logos/default.png';
  const toLogoSrc = LOGO_MAP[integration.to.toLowerCase()] || '/logos/default.png';

  const lastSyncDate = new Date(integration.lastSync.date);
  const manageUrl = `/clients/${integration.clientId}/integrations/${integration.id}/mapping`;

  return (
    <Card className="flex flex-col hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <Image src={fromLogoSrc} alt={`${integration.from} logo`} width={120} height={48} />
              </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
             <div className="flex items-center gap-2">
                <Image src={toLogoSrc} alt={`${integration.to} logo`} width={120} height={48} />
              </div>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                 <Link href={manageUrl}><Settings className="mr-2 h-4 w-4"/> Edit Configuration</Link>
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
           <Link href={manageUrl}>
            Manage Integration
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
