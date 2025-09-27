'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/app-shell';
import { Stepper } from '@/components/ui/stepper';
import { IntegrationSelection } from '@/components/integrations/integration-selection';
import { ConnectPosForm } from '@/components/integrations/connect-pos-form';
import { ConnectErpForm } from '@/components/integrations/connect-erp-form';
import SettingsForm from '@/components/integrations/settings-form';
import MappingTabs from '@/components/integrations/mapping-tabs';

const steps = [
  'Select',
  'Connect POS',
  'Connect ERP',
  'Settings',
  'Mapping',
];

export default function NewIntegrationPage({ params }: { params: { clientId: 'string' } }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    handleNext();
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <IntegrationSelection onSelect={handleSelectTemplate} />;
      case 1:
        return <ConnectPosForm onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <ConnectErpForm onNext={handleNext} onBack={handleBack} />;
      case 3:
        // For now, passing dummy data. This would come from the integration context.
        return <SettingsForm onNext={handleNext} onBack={handleBack} settings={{ autoSync: true, frequency: 'daily' }} />;
      case 4:
        // Similarly, dummy data for mapping.
        return <MappingTabs onBack={handleBack} clientId={params.clientId} integrationId="new" />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col items-center">
        <div className="mb-12 w-full max-w-2xl mx-auto">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>
        <div className="w-full max-w-4xl">
          {renderStepContent()}
        </div>
      </div>
    </AppShell>
  );
}
