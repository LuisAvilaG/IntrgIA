'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface IntegrationTemplate {
  id: string;
  name: string;
  source: { name: string; logo: string };
  destination: { name: string; logo: string };
  description: string;
}

const templates: IntegrationTemplate[] = [
  {
    id: 'simphony-netsuite',
    name: 'Simphony → NetSuite',
    source: { name: 'Simphony', logo: '/logos/simphony.png' },
    destination: { name: 'NetSuite', logo: '/logos/netsuite.png' },
    description: 'Sync sales and customer data from Simphony POS to NetSuite ERP.',
  },
  {
    id: 'shopify-netsuite',
    name: 'Shopify → NetSuite',
    source: { name: 'Shopify', logo: '/logos/shopify.png' },
    destination: { name: 'NetSuite', logo: '/logos/netsuite.png' },
    description: 'Sync orders, products, and customers from Shopify to NetSuite.',
  },
];

interface IntegrationSelectionProps {
  onSelect: (templateId: string) => void;
}

export function IntegrationSelection({ onSelect }: IntegrationSelectionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Select Integration Template</h2>
        <p className="text-muted-foreground">Choose a pre-configured template to get started.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {templates.map((template) => (
          <Card
            key={template.id}
            onClick={() => setSelected(template.id)}
            className={cn('cursor-pointer transition-all', {
              'border-primary ring-2 ring-primary': selected === template.id,
            })}
          >
            <CardContent className="flex flex-col items-center text-center p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Image src={template.source.logo} alt={`${template.source.name} logo`} width={120} height={120} className="rounded-md" />
                <span className="text-2xl font-bold">→</span>
                <Image src={template.destination.logo} alt={`${template.destination.name} logo`} width={120} height={120} className="rounded-md" />
              </div>
              <h3 className="text-lg font-semibold">{template.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button onClick={() => selected && onSelect(selected)} disabled={!selected} className="mt-8 w-full max-w-xs">
        Next
      </Button>
    </div>
  );
}
