import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import shopifyLogo from '/public/logos/shopify.png';
import netsuiteLogo from '/public/logos/netsuite.png';
import toastLogo from '/public/logos/toast.png';
import simphonyLogo from '/public/logos/simphony.png';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntegrationSelectionProps {
  onSelect: (templateId: string) => void;
  isLoading: boolean;
}

const templates = [
  {
    id: 'shopify-netsuite',
    from: { name: 'Shopify', logo: shopifyLogo },
    to: { name: 'NetSuite', logo: netsuiteLogo },
    description: 'Sync sales, customers, and inventory.',
  },
  {
    id: 'toast-simphony',
    from: { name: 'Toast', logo: toastLogo },
    to: { name: 'Simphony', logo: simphonyLogo },
    description: 'Sync menu items and sales data.',
  },
  {
    id: 'simphony-netsuite',
    from: { name: 'Simphony', logo: simphonyLogo },
    to: { name: 'NetSuite', logo: netsuiteLogo },
    description: 'Sync sales, orders, and payments.',
  },
];

export function IntegrationSelection({ onSelect, isLoading }: IntegrationSelectionProps) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">Select an Integration Template</h1>
      <p className="mt-2 text-muted-foreground">Choose a pre-built template to get started quickly.</p>
      {isLoading && <Loader2 className="mx-auto mt-8 h-8 w-8 animate-spin text-primary" />}
      <div className={cn("mt-10 grid grid-cols-1 md:grid-cols-2 gap-8", { 'opacity-50 pointer-events-none': isLoading })}>
        {templates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => !isLoading && onSelect(template.id)}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img src={template.from.logo} alt={template.from.name} className="h-6 object-contain" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <img src={template.to.logo} alt={template.to.name} className="h-6 object-contain" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-left">
              <CardTitle>{template.from.name} to {template.to.name}</CardTitle>
              <CardDescription className="mt-1">{template.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
