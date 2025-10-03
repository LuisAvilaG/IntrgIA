'use client';

import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "../ui/button";
import { useEffect, useState, useMemo, useCallback } from "react";
import { apiPost } from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { ReactSelectCombobox, ComboboxOption } from "../ui/react-select-combobox";

interface MappingTabsProps {
  onBack: () => void;
  integrationId: string | null;
}

const formatTabTitle = (standardName: string) => {
  return standardName.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

export default function MappingTabs({ onBack, integrationId }: MappingTabsProps) {
  const { clientId } = useParams<{ clientId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discoveredData, setDiscoveredData] = useState<any>(null);
  
  const [mappings, setMappings] = useState<any>({});

  const handleMappingChange = (mappingKey: string, sourceValue: string, field: string, value: string) => {
    setMappings((prev: any) => {
      const newMappings = { ...prev };
      if (!newMappings[mappingKey]) {
        newMappings[mappingKey] = [];
      }
      
      let entry = newMappings[mappingKey].find((m: any) => m.sourceValue === sourceValue);
      if (entry) {
        entry[field] = value || null;
      } else {
        newMappings[mappingKey].push({ sourceValue, [field]: value || null });
      }
      return newMappings;
    });
  };

  const fetchMappingData = useCallback(async () => {
    if (!integrationId) {
      toast.error("Integration ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiPost('/api/discover-advanced-mappings', { integrationId, action: 'discover' });
      let responseData = response.data;
      if (Array.isArray(responseData) && responseData.length > 0) responseData = responseData[0];

      if (responseData.status === 'success') {
        setDiscoveredData(responseData);
        toast.success("Mapping data loaded!");
      } else {
        throw new Error(responseData.message || "Failed to fetch mapping data.");
      }
    } catch (error: any) {
      toast.error(`Failed to load data: ${error.message}`);
      setDiscoveredData(null);
    } finally {
      setIsLoading(false);
    }
  }, [integrationId]);

  useEffect(() => {
    if (integrationId) {
      fetchMappingData();
    } else {
      setIsLoading(false);
    }
  }, [integrationId, fetchMappingData]);

  const handleFinish = async () => {
    if (!integrationId) { toast.error("Integration ID is missing."); return; }
    setIsSubmitting(true);
    try {
        const payload = {
            integrationId,
            action: 'save',
            mappings,
        };
        const response = await apiPost('/api/discover-advanced-mappings', payload);
        let responseData = response.data;
        if (Array.isArray(responseData) && responseData.length > 0) responseData = responseData[0];
        
        if (responseData.status === 'success') {
            toast.success(responseData.message || "Mappings saved successfully!");
        } else {
            throw new Error(responseData.message || "Failed to save mappings.");
        }
    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const mappingKeys = useMemo(() => discoveredData?.discoveredMappings ? Object.keys(discoveredData.discoveredMappings) : [], [discoveredData]);

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading mapping data...</div>;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div><CardTitle>Advanced Mapping</CardTitle><CardDescription>Map the discovered values to the corresponding NetSuite fields.</CardDescription></div>
            <Button variant="outline" size="icon" onClick={fetchMappingData} disabled={isLoading}><RefreshCw className="h-4 w-4" /><span className="sr-only">Reload</span></Button>
        </div>
      </CardHeader>

      {(!discoveredData || mappingKeys.length === 0) ? (
        <CardContent><p className="text-muted-foreground text-center py-8">No mapping fields detected. Check your file format configuration or try reloading.</p></CardContent>
      ) : (
        <CardContent>
            <Tabs defaultValue={mappingKeys[0]}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${mappingKeys.length}, minmax(0, 1fr))` }}>
                {mappingKeys.map(key => <TabsTrigger key={key} value={key}>{formatTabTitle(key)}</TabsTrigger>)}
            </TabsList>
            {mappingKeys.map(key => (
                <TabsContent key={key} value={key} className="mt-6">
                <MappingTable 
                    mappingKey={key}
                    discoveredValues={discoveredData.discoveredMappings[key]}
                    netsuiteData={discoveredData.netsuiteData}
                    onMappingChange={handleMappingChange}
                />
                </TabsContent>
            ))}
            </Tabs>
        </CardContent>
      )}

      <CardFooter className="justify-end gap-2">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>Back</Button>
        <Link to={`/clients/${clientId}`}>
          <Button onClick={handleFinish} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Finish
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function MappingTable({ mappingKey, discoveredValues, netsuiteData, onMappingChange }: { mappingKey: string, discoveredValues: string[], netsuiteData: any, onMappingChange: Function }) {
  const accountOptions: ComboboxOption[] = useMemo(() => netsuiteData?.accounts?.map((a: any) => ({ value: a.id, label: a.name })) || [], [netsuiteData]);
  const classOptions: ComboboxOption[] = useMemo(() => netsuiteData?.classes?.map((c: any) => ({ value: c.id, label: c.name })) || [], [netsuiteData]);
  const departmentOptions: ComboboxOption[] = useMemo(() => netsuiteData?.departments?.map((d: any) => ({ value: d.id, label: d.name })) || [], [netsuiteData]);

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader><TableRow><TableHead>{formatTabTitle(mappingKey)}</TableHead><TableHead>NetSuite Account</TableHead><TableHead>NetSuite Class</TableHead><TableHead>NetSuite Department</TableHead></TableRow></TableHeader>
        <TableBody>
          {discoveredValues.map(value => (
            <TableRow key={value}>
              <TableCell className="font-medium">{value}</TableCell>
              <TableCell><ReactSelectCombobox options={accountOptions} onChange={(v) => onMappingChange(mappingKey, value, 'netsuiteAccount', v)} placeholder="Select Account..." isClearable /></TableCell>
              <TableCell><ReactSelectCombobox options={classOptions} onChange={(v) => onMappingChange(mappingKey, value, 'netsuiteClass', v)} placeholder="Select Class..." isClearable /></TableCell>
              <TableCell><ReactSelectCombobox options={departmentOptions} onChange={(v) => onMappingChange(mappingKey, value, 'netsuiteDepartment', v)} placeholder="Select Department..." isClearable /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
