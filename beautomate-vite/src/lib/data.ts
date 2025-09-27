import type { Client, Integration, Account, Subsidiary, MappingItem, TaxMappingItem } from './definitions';

const integrations: Integration[] = [
  {
    id: 'int_001',
    clientId: 'cl_001',
    from: 'simphony',
    to: 'netsuite',
    status: 'active',
    lastSync: { date: '2024-07-23T10:00:00Z', status: 'success' },
    nextSync: '2024-07-24T10:00:00Z',
    clientConfiguration: 'Business Type: Quick Service Restaurant, POS: Simphony, Accounting: NetSuite, Locations: 5, Goal: Daily sales summary journal entry.'
  },
  {
    id: 'int_002',
    clientId: 'cl_001',
    from: 'toast',
    to: 'netsuite',
    status: 'paused',
    lastSync: { date: '2024-07-22T18:30:00Z', status: 'failure' },
    nextSync: 'N/A',
    clientConfiguration: 'Business Type: Fine Dining, POS: Toast, Accounting: NetSuite, Locations: 1, Goal: Itemized invoice per order.'
  },
  {
    id: 'int_003',
    clientId: 'cl_002',
    from: 'toast',
    to: 'netsuite',
    status: 'active',
    lastSync: { date: '2024-07-23T11:00:00Z', status: 'success' },
    nextSync: '2024-07-24T11:00:00Z',
    clientConfiguration: 'Business Type: Cafe Chain, POS: Toast, Accounting: NetSuite, Locations: 25, Goal: Daily sales summary with location-based segmentation.'
  },
];

export const clients: Client[] = [
  {
    id: 'cl_001',
    name: 'Global Food Corp',
    activeIntegrations: 1,
    healthStatus: 'good',
    integrations: [integrations[0], integrations[1]],
  },
  {
    id: 'cl_002',
    name: 'Gourmet Innovations',
    activeIntegrations: 1,
    healthStatus: 'good',
    integrations: [integrations[2]],
  },
  {
    id: 'cl_003',
    name: 'Quick Eats LLC',
    activeIntegrations: 0,
    healthStatus: 'bad',
    integrations: [],
  },
  {
    id: 'cl_004',
    name: 'The Coffee Spot',
    activeIntegrations: 5,
    healthStatus: 'good',
    integrations: [],
  },
];

export const getClientById = (id: string) => clients.find(c => c.id === id);
export const getIntegrationsByClientId = (clientId: string) => integrations.filter(i => i.clientId === clientId);
export const getIntegrationById = (id: string) => integrations.find(i => i.id === id);


export const netsuiteSubsidiaries: Subsidiary[] = [
  { value: 'sub_1', label: 'BeAutomate US' },
  { value: 'sub_2', label: 'BeAutomate EMEA' },
  { value: 'sub_3', label: 'BeAutomate APAC' },
];

export const netsuiteAccounts: Account[] = [
  { value: 'acc_1001', label: '1001 - Sales Revenue' },
  { value: 'acc_1002', label: '1002 - Food Sales' },
  { value: 'acc_1003', label: '1003 - Beverage Sales' },
  { value: 'acc_2001', label: '2001 - Batch Clearing' },
  { value: 'acc_2002', label: '2002 - Undeposited Funds' },
  { value: 'acc_3001', label: '3001 - Sales Tax Payable' },
];

export const salesMappingData: MappingItem[] = [
    { id: '1', toastItem: 'Default for All Sales', netsuiteAccount: '1001 - Sales Revenue', location: 'Default', class: 'Default', department: 'Default' },
    { id: '2', toastItem: 'Burger', netsuiteAccount: '1002 - Food Sales', location: 'Store 1', class: 'Food', department: 'Kitchen' },
    { id: '3', toastItem: 'Fries', netsuiteAccount: '1002 - Food Sales', location: 'Store 1', class: 'Food', department: 'Kitchen' },
    { id: '4', toastItem: 'Soda', netsuiteAccount: '1003 - Beverage Sales', location: 'Store 1', class: 'Beverage', department: 'Front' },
];

export const taxMappingData: TaxMappingItem[] = [
    { id: '1', toastTax: 'Default for All Taxes', netsuiteAccount: '3001 - Sales Tax Payable', vendor: 'Default', location: 'Default', class: 'Default', department: 'Default' },
    { id: '2', toastTax: 'City Tax', netsuiteAccount: '3001 - Sales Tax Payable', vendor: 'City Tax Authority', location: 'Default', class: 'Tax', department: 'Finance' },
    { id: '3', toastTax: 'State Tax', netsuiteAccount: '3001 - Sales Tax Payable', vendor: 'State Tax Authority', location: 'Default', class: 'Tax', department: 'Finance' },
];
