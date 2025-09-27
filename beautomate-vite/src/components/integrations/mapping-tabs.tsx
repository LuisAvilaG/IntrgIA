'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "../ui/button"
import { salesMappingData, taxMappingData, netsuiteAccounts } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface MappingTabsProps {
  clientId: string;
  integrationId: string; // 'new' in this flow
  onBack: () => void;
}

export default function MappingTabs({ clientId, onBack }: MappingTabsProps) {
  const { toast } = useToast();

  const handleFinish = () => {
    // In a real app, this would submit the final configuration.
    toast({
      title: "Integration Created!",
      description: "The new integration has been successfully configured.",
    });
    // For now, we'll just log it. A real implementation would redirect.
    console.log("Finished creation flow for client:", clientId);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Mapping</CardTitle>
        <CardDescription>Map data from your POS to NetSuite fields. Default rules are applied unless a specific override is set.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sales">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="taxes">Taxes</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          <TabsContent value="sales" className="mt-6">
            <MappingTable type="sales"/>
          </TabsContent>
          <TabsContent value="taxes" className="mt-6">
            <MappingTable type="taxes"/>
          </TabsContent>
          <TabsContent value="discounts" className="mt-6">
            <p className="text-muted-foreground text-center py-8">Discount mapping configuration coming soon.</p>
          </TabsContent>
          <TabsContent value="payments" className="mt-6">
            <p className="text-muted-foreground text-center py-8">Payment mapping configuration coming soon.</p>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Link href={`/clients/${clientId}`}>
          <Button onClick={handleFinish}>Finish</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}


function MappingTable({ type }: { type: 'sales' | 'taxes'}) {
  const isSales = type === 'sales';
  const data = isSales ? salesMappingData : taxMappingData;
  const headers = isSales
    ? ["Toast Item", "NetSuite Account", "Location", "Class", "Department", ""]
    : ["Toast Tax", "NetSuite Account", "Vendor", "Location", "Class", "Department", ""];

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map(h => <TableHead key={h}>{h}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.id} className={cn(index === 0 && 'bg-primary/10 hover:bg-primary/15')}>
              <TableCell className="font-medium">{isSales ? item.toastItem : (item as any).toastTax}</TableCell>
              
              <TableCell>
                 <SearchableSelect defaultValue={item.netsuiteAccount} />
              </TableCell>

              {!isSales && <TableCell><SearchableSelect defaultValue={(item as any).vendor} /></TableCell>}
              
              <TableCell><SearchableSelect defaultValue={item.location} /></TableCell>
              <TableCell><SearchableSelect defaultValue={item.class} /></TableCell>
              <TableCell><SearchableSelect defaultValue={item.department} /></TableCell>
              
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SearchableSelect({ defaultValue }: { defaultValue: string }) {
    // This is a placeholder for a real searchable select (Combobox).
    // For now, it uses the standard Select component.
    const isDefault = defaultValue === "Default";
    const selectedValue = netsuiteAccounts.find(a => a.label === defaultValue)?.value;
    
    return (
        <Select defaultValue={selectedValue}>
            <SelectTrigger className={cn("w-[180px]", isDefault && "text-muted-foreground italic border-dashed")}>
                <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="default" disabled>{defaultValue}</SelectItem>
                <SelectSeparator/>
                {netsuiteAccounts.map(account => (
                    <SelectItem key={account.value} value={account.value}>
                        {account.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

// Separator is not exported from select, so we make a simple one here.
const SelectSeparator = () => <div className="-mx-1 my-1 h-px bg-muted" />;
