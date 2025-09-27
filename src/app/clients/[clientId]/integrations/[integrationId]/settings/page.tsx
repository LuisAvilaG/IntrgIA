import { notFound } from 'next/navigation';
import { getIntegrationById } from '@/lib/data';
import SettingsForm from '@/components/integrations/settings-form';

export default function SettingsPage({ params }: { params: { integrationId: string } }) {
  const integration = getIntegrationById(params.integrationId);

  if (!integration) {
    notFound();
  }

  return <SettingsForm integration={integration} />;
}
