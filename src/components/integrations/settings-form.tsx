'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import type { Integration } from '@/lib/definitions';
import { netsuiteAccounts, netsuiteSubsidiaries } from '@/lib/data';
import { getAiSuggestions } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const settingsSchema = z.object({
  salesPostingMethod: z.enum(['Journal Entry', 'Itemized Invoice']),
  subsidiary: z.string(),
  batchClearingAccount: z.string(),
  includeZeroSalesLines: z.boolean(),
  memoFormat: z.string(),
  customMemo: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsForm({ integration }: { integration: Integration }) {
  const { toast } = useToast();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiClientConfig, setAiClientConfig] = useState(integration.clientConfiguration);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      salesPostingMethod: 'Journal Entry',
      subsidiary: '',
      batchClearingAccount: '',
      includeZeroSalesLines: false,
      memoFormat: 'POS + Date',
      customMemo: '',
    },
  });

  const memoFormat = form.watch('memoFormat');
  const memoPreview = {
    'POS + Date': `${integration.from} ${new Date().toISOString().split('T')[0]}`,
    'Store + Date': `Store Name ${new Date().toISOString().split('T')[0]}`,
    'Location': 'Location Name',
    'Location ID': 'Location-123',
    'Custom': form.watch('customMemo') || ''
  }[memoFormat] || '';

  const handleAiSuggest = async () => {
    setIsGenerating(true);
    try {
      const result = await getAiSuggestions({ clientConfiguration: aiClientConfig });
      
      // Select requires valid values. Let's find the closest matches.
      const suggestedSubsidiary = netsuiteSubsidiaries.find(s => s.label.includes(result.accountMappingSuggestions?.subsidiary || ''))?.value || netsuiteSubsidiaries[0].value;
      const suggestedBatchAccount = netsuiteAccounts.find(a => a.label.includes(result.batchClearingAccount))?.value || netsuiteAccounts[0].value;

      form.reset({
        salesPostingMethod: result.salesPostingMethod as 'Journal Entry' | 'Itemized Invoice',
        subsidiary: suggestedSubsidiary,
        batchClearingAccount: suggestedBatchAccount,
        includeZeroSalesLines: result.includeZeroSalesLines,
        memoFormat: result.memoFormat,
        customMemo: result.memoFormat === 'Custom' ? result.memoFormat : ''
      });
      toast({
        title: "AI Suggestions Applied",
        description: "The form has been populated with AI-powered suggestions.",
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch AI suggestions. Please try again.",
      });
    } finally {
      setIsGenerating(false);
      setIsAiModalOpen(false);
    }
  };
  
  const onSubmit = (data: SettingsFormValues) => {
    console.log(data);
    toast({
      title: "Settings Saved",
      description: "Your integration settings have been successfully updated.",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Define the high-level rules for creating accounting entries.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsAiModalOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Suggest with AI
            </Button>
          </div>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <Controller
              control={form.control}
              name="salesPostingMethod"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Sales Posting Method</Label>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Journal Entry" id="je" />
                      <Label htmlFor="je">Journal Entry</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Itemized Invoice" id="ii" />
                      <Label htmlFor="ii">Itemized Invoice</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <Controller
                control={form.control}
                name="subsidiary"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Subsidiary</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select a subsidiary" /></SelectTrigger>
                      <SelectContent>
                        {netsuiteSubsidiaries.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="batchClearingAccount"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Batch Clearing Account</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select an account" /></SelectTrigger>
                      <SelectContent>
                        {netsuiteAccounts.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>
            
            <Controller
              control={form.control}
              name="includeZeroSalesLines"
              render={({ field }) => (
                <div className="flex items-center space-x-4 rounded-lg border p-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Include Zero Sales Lines</p>
                    <p className="text-sm text-muted-foreground">Post lines with a zero amount to the accounting system.</p>
                  </div>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="memoFormat"
              render={({ field }) => (
                <div className="space-y-4">
                  <Label>Memo</Label>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {['POS + Date', 'Store + Date', 'Location', 'Location ID', 'Custom'].map(val => (
                       <div key={val}>
                          <RadioGroupItem value={val} id={val} className="peer sr-only" />
                          <Label htmlFor={val} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            {val}
                          </Label>
                        </div>
                    ))}
                  </RadioGroup>
                  {memoFormat === 'Custom' && (
                     <Input {...form.register('customMemo')} placeholder="Enter custom memo format" />
                  )}
                  <p className="text-sm text-muted-foreground">Preview: <span className="font-mono p-1 bg-muted rounded-sm">{memoPreview}</span></p>
                </div>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit">Save Settings</Button>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suggest Sales Posting Rules</DialogTitle>
            <DialogDescription>
              Describe your client's configuration. Our AI will suggest the most efficient sales posting rules.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="client-config">Client Configuration</Label>
            <Textarea
              id="client-config"
              value={aiClientConfig}
              onChange={(e) => setAiClientConfig(e.target.value)}
              rows={6}
              placeholder="e.g., Business Type: Quick Service Restaurant, POS: Simphony..."
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAiModalOpen(false)} disabled={isGenerating}>Cancel</Button>
            <Button onClick={handleAiSuggest} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
