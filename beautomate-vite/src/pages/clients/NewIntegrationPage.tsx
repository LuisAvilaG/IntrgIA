import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stepper } from '@/components/ui/stepper';
import { IntegrationSelection } from '@/components/integrations/integration-selection';
import { ConnectPosForm } from '@/components/integrations/connect-pos-form';
import { ConnectErpForm } from '@/components/integrations/connect-erp-form';
import SettingsForm from '@/components/integrations/settings-form';
import MappingTabs from '@/components/integrations/mapping-tabs';
import { apiGet, apiPost } from '@/lib/api';
import toast from 'react-hot-toast';

const steps = [
  'Select',
  'Connect POS',
  'Connect ERP',
  'Settings',
  'Mapping',
];

const formatIntegrationType = (templateId: string): string => {
    return templateId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-');
};

export default function NewIntegrationPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newIntegrationId, setNewIntegrationId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // State to hold the data from each step
  const [posCredentials, setPosCredentials] = useState(null);
  const [erpCredentials, setErpCredentials] = useState(null);

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleSelectTemplate = async (templateId: string) => {
    if (!clientId) {
      toast.error("Client ID is missing.");
      return;
    }

    setIsLoading(true);
    try {
      const clientResponse = await apiGet(`/clients?id=${clientId}`);
      let clientData = clientResponse.data;
      if (Array.isArray(clientData) && clientData.length > 0) clientData = clientData[0];
      if (!clientData || !clientData.clientID) throw new Error("Could not retrieve client details.");
      
      const payload = {
        clientid: clientData.clientID,
        integratioType: formatIntegrationType(templateId),
      };

      const response = await apiPost('/integrations', payload);
      const createdIntegrationId = response.data.integrationid || response.data.integrationId;

      if (response.data.status === 'success' && createdIntegrationId) {
        toast.success('Registro de integración creado!');
        setNewIntegrationId(createdIntegrationId);
        setSelectedTemplate(templateId);
        handleNext();
      } else {
        throw new Error('No se pudo crear el registro de integración.');
      }
    } catch (error: any) {
      console.error("Error creating integration record:", error);
      toast.error(error.message || "Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePosSubmit = (data: any) => {
    setPosCredentials(data);
    handleNext();
  };

  const handleErpSubmit = (data: any) => {
    setErpCredentials(data);
    handleNext();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <IntegrationSelection onSelect={handleSelectTemplate} isLoading={isLoading} />;
      case 1:
        return (
          <ConnectPosForm 
            onNext={handlePosSubmit} 
            onBack={handleBack} 
            template={selectedTemplate} 
            integrationId={newIntegrationId}
            initialData={posCredentials}
          />
        );
      case 2:
        return (
          <ConnectErpForm
            onNext={handleErpSubmit}
            onBack={handleBack}
            template={selectedTemplate}
            integrationId={newIntegrationId}
            initialData={erpCredentials}
          />
        );
      case 3:
        return <SettingsForm onNext={handleNext} onBack={handleBack} settings={{}} />;
      case 4:
        return <MappingTabs onBack={handleBack} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-12 w-full max-w-4xl mx-auto">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>
      <div className="w-full max-w-4xl">
        {renderStepContent()}
      </div>
    </div>
  );
}
