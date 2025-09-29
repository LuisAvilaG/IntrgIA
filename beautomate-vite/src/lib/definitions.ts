export type Client = {
  id: number;
  createdAt: string;
  updatedAt: string;
  clientID: string;
  clientName: string;
  clientContact_name: string;
  clientContact_email: string;
  PeriodoDeFacturacion: string;
  FechaDeRenovacion: string;
  integrationCount: number; // This will be calculated
  status: 'Active' | 'Inactive'; // This will be determined
};

export type System = {
  name: string;
  logo: string;
};

export type Integration = {
  id: string;
  clientId: string;
  posSystem: System;
  erpSystem: System;
  status: 'active' | 'paused' | 'error';
  lastSync: {
    date: string;
    status: 'success' | 'failure';
  };
  nextSync: string;
};

export type Subsidiary = {
  value: string;
  label: string;
};

export type Account = {
  value: string;
  label: string;
};

export interface MappingItem {
  id: string;
  toastItem: string;
  netsuiteAccount: string;
  location: string;
  class: string;
  department: string;
}

export interface TaxMappingItem {
  id: string;
  toastTax: string;
  netsuiteAccount: string;
  vendor: string;
  location: string;
  class: string;
  department: string;
}
