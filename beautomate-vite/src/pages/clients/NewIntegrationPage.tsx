import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Stepper } from '@/components/ui/stepper';
import { IntegrationSelection } from '@/components/integrations/integration-selection';
import { ConnectPosForm, PosConnectionDetails } from '@/components/integrations/connect-pos-form';
import SftpFileConfigForm from '@/components/integrations/sftp-file-config-form';
import { ConnectErpForm } from '@/components/integrations/connect-erp-form';
import SettingsForm from '@/components/integrations/settings-form';
import FileFormatForm from '@/components/integrations/file-format-form';
import MappingTabs from '@/components/integrations/mapping-tabs';
import { apiGet, apiPost } from '@/lib/api';
import toast from 'react-hot-toast';

const BASE_STEPS = ['Select', 'Connect POS', 'Connect ERP', 'Settings', 'Mapping'];
const SFTP_STEPS = ['Select', 'Connect POS', 'SFTP File Config', 'Connect ERP', 'Settings', 'File Format', 'Mapping'];

const formatIntegrationType = (templateId: string): string => {
    return templateId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
};

export default function NewIntegrationPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newIntegrationId, setNewIntegrationId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [posConnectionType, setPosConnectionType] = useState<string | null>(null);
  
  const [posCredentials, setPosCredentials] = useState(null);
  const [sftpConfig, setSftpConfig] = useState(null);
  const [erpCredentials, setErpCredentials] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [fileFormatConfig, setFileFormatConfig] = useState(null);

  const steps = useMemo(() => posConnectionType === 'sftp' ? SFTP_STEPS : BASE_STEPS, [posConnectionType]);

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // **LA CORRECCIÓN:** Restaurar la lógica completa de esta función
  const handleSelectTemplate = async (templateId: string) => {
    if (!clientId) { toast.error("Client ID is missing."); return; }
    setIsLoading(true);
    try {
      const clientResponse = await apiGet(`/clients?id=${clientId}`);
      let clientData = clientResponse.data;
      if (Array.isArray(clientData) && clientData.length > 0) clientData = clientData[0];
      if (!clientData || !clientData.clientID) throw new Error("Could not retrieve client details.");
      
      const payload = { clientid: clientData.clientID, integratioType: formatIntegrationType(templateId) };
      const response = await apiPost('/integrations', payload);
      let responseData = response.data;
       if (Array.isArray(responseData) && responseData.length > 0) responseData = responseData[0];
      const createdIntegrationId = responseData.integrationid || responseData.integrationId;

      if (responseData.status === 'success' && createdIntegrationId) {
        toast.success('Integration record created!');
        setNewIntegrationId(createdIntegrationId);
        setSelectedTemplate(templateId);
        handleNext();
      } else {
        throw new Error(responseData.message || 'Could not create integration record.');
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePosSubmit = (details: PosConnectionDetails) => {
    setPosCredentials(details.credentials);
    setPosConnectionType(details.connectionType);
    handleNext();
  };

  const handleSftpConfigSubmit = (data: any) => {
    setSftpConfig(data);
    handleNext();
  }

  const handleErpSubmit = (data: any) => {
    setErpCredentials(data);
    handleNext();
  };

  const handleSettingsSubmit = (data: any) => {
    setAnalysisData(data);
    handleNext();
  };

  const handleFileFormatSubmit = (data: any) => {
    setFileFormatConfig(data);
    handleNext();
  }

  const renderStepContent = () => {
    const currentStepName = steps[currentStep];

    switch (currentStepName) {
      case 'Select':
        return <IntegrationSelection onSelect={handleSelectTemplate} isLoading={isLoading} />;
      case 'Connect POS':
        return <ConnectPosForm onNext={handlePosSubmit} onBack={handleBack} template={selectedTemplate} integrationId={newIntegrationId} initialData={posCredentials} />;
      case 'SFTP File Config':
        return <SftpFileConfigForm onNext={handleSftpConfigSubmit} onBack={handleBack} integrationId={newIntegrationId} initialData={sftpConfig} />;
      case 'Connect ERP':
        return <ConnectErpForm onNext={handleErpSubmit} onBack={handleBack} template={selectedTemplate} integrationId={newIntegrationId} initialData={erpCredentials} />;
      case 'Settings':
        return <SettingsForm onNext={handleSettingsSubmit} onBack={handleBack} settings={analysisData || {}} integrationId={newIntegrationId} />;
      case 'File Format':
        return <FileFormatForm onNext={handleFileFormatSubmit} onBack={handleBack} integrationId={newIntegrationId} analysisData={analysisData} initialData={fileFormatConfig} />;
      case 'Mapping':
        return <MappingTabs onBack={handleBack} integrationId={newIntegrationId} />;
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
