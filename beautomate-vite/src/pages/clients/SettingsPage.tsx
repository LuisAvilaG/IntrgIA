import { useParams } from 'react-router-dom';
import { getIntegrationById } from '@/lib/data';
import SettingsForm from '@/components/integrations/settings-form';

export default function SettingsPage() {
  const { integrationId } = useParams<{ integrationId: string }>();

  if (!integrationId) {
    return <div>Integration ID is missing</div>;
  }

  const integration = getIntegrationById(integrationId);

  if (!integration) {
    return <div>Integration not found</div>;
  }

  return <SettingsForm integration={integration} />;
}
