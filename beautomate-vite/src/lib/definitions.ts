export type Client = {
  id: string;
  name: string;
  activeIntegrations: number;
  healthStatus: 'good' | 'bad';
  integrations: Integration[];
};

export type Integration = {
  id: string;
  clientId: string;
  from: 'simphony' | 'toast' | string;
  to: 'netsuite' | string;
  status: 'active' | 'paused';
  lastSync: {
    date: string;
    status: 'success' | 'failure';
  };
  nextSync: string;
  clientConfiguration: string;
};

export type Account = {
  value: string;
  label: string;
};

export type Subsidiary = {
  value: string;
  label: string;
};

export type MappingItem = {
  id: string;
  toastItem: string;
  netsuiteAccount: string;
  location: string;
  class: string;
  department: string;
};

export type TaxMappingItem = {
  id: string;
  toastTax: string;
  netsuiteAccount: string;
  vendor: string;
  location: string;
  class: string;
  department: string;
};
