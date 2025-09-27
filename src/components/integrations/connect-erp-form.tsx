'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConnectErpFormProps {
  onNext: () => void;
  onBack: () => void;
}

export function ConnectErpForm({ onNext, onBack }: ConnectErpFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect ERP System</CardTitle>
        <CardDescription>Enter the credentials for the NetSuite ERP system.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6">
          {/* Fields for NetSuite TBA */}
          <div className="grid gap-2">
            <Label htmlFor="account-id">Account ID</Label>
            <Input id="account-id" placeholder="Enter NetSuite Account ID" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="consumer-key">Consumer Key</Label>
            <Input id="consumer-key" placeholder="Enter Consumer Key" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="consumer-secret">Consumer Secret</Label>
            <Input id="consumer-secret" type="password" placeholder="Enter Consumer Secret" />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="token-id">Token ID</Label>
            <Input id="token-id" placeholder="Enter Token ID" />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="token-secret">Token Secret</Label>
            <Input id="token-secret" type="password" placeholder="Enter Token Secret" />
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
