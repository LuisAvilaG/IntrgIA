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
import { netsuiteAccounts, netsuiteSubsidiaries } from '@/lib/data';
import { getAiSuggestions } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const settingsSchema = z.object({
  autoSync: z.boolean(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  settings: Partial<SettingsFormValues>;
  onNext: () => void;
  onBack: () => void;
}

export default function SettingsForm({ settings, onNext, onBack }: SettingsFormProps) {
  const { toast } = useToast();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiClientConfig, setAiClientConfig] = useState('');

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      autoSync: settings.autoSync ?? true,
      frequency: settings.frequency ?? 'daily',
    },
  });

  const onSubmit = (data: SettingsFormValues) => {
    console.log(data);
    toast({
      title: "Settings Validated",
      description: "Moving to the next step.",
    });
    onNext();
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Define the high-level rules for the integration.</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={() => setIsAiModalOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                Suggest with AI
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
             <Controller
              control={form.control}
              name="autoSync"
              render={({ field }) => (
                <div className="flex items-center space-x-4 rounded-lg border p-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Auto Sync</p>
                    <p className="text-sm text-muted-foreground">Automatically sync data based on the chosen frequency.</p>
                  </div>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="frequency"
              render={({ field }) => (
                 <div className="space-y-2">
                    <Label>Sync Frequency</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select a frequency" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="outline" onClick={onBack}>Back</Button>
            <Button type="submit">Next</Button>
          </CardFooter>
        </Card>
      </form>

      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suggest Settings</DialogTitle>
            <DialogDescription>
              Describe your client's business. Our AI will suggest the best settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="client-config">Client Configuration</Label>
            <Textarea
              id="client-config"
              value={aiClientConfig}
              onChange={(e) => setAiClientConfig(e.target.value)}
              rows={6}
              placeholder="e.g., Business Type: E-commerce, POS: Shopify..."
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAiModalOpen(false)} disabled={isGenerating}>Cancel</Button>
            <Button onClick={() => {}} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
