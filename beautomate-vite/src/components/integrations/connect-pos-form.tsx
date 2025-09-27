'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConnectPosFormProps {
  onNext: () => void;
  onBack: () => void;
}

export function ConnectPosForm({ onNext, onBack }: ConnectPosFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect POS System</CardTitle>
        <CardDescription>Enter the credentials for the Point of Sale system.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="connection-type">Connection Type</Label>
            <Select>
              <SelectTrigger id="connection-type">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="sftp">SFTP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input id="api-key" placeholder="Enter API key" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="api-secret">API Secret</Label>
            <Input id="api-secret" type="password" placeholder="Enter API secret" />
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Next</Button>
      </CardFooter>
    </Card>
  );
}
