import type { Client, Integration, Account, Subsidiary, MappingItem, TaxMappingItem } from './definitions';

const integrations: Integration[] = [
  {
    id: 'int_001',
    clientId: 'cl_001',
    posSystem: { name: 'Simphony', logo: '/logos/simphony.png' },
    erpSystem: { name: 'NetSuite', logo: '/logos/netsuite.png' },
    status: 'active',
    lastSync: { date: '2 hours ago', status: 'success' },
    nextSync: 'in 22 hours',
  },
  {
    id: 'int_002',
    clientId: 'cl_001',
    posSystem: { name: 'Toast', logo: '/logos/toast.png' },
    erpSystem: { name: 'NetSuite', logo: '/logos/netsuite.png' },
    status: 'paused',
    lastSync: { date: '1 day ago', status: 'failure' },
    nextSync: 'N/A',
  },
  {
    id: 'int_003',
    clientId: 'cl_002',
    posSystem: { name: 'Toast', logo: '/logos/toast.png' },
    erpSystem: { name: 'NetSuite', logo: '/logos/netsuite.png' },
    status: 'active',
    lastSync: { date: '1 hour ago', status: 'success' },
    nextSync: 'in 23 hours',
  },
];

export const clients: Client[] = [
  {
    id: 'cl_001',
    name: 'Global Food Corp',
    status: 'Active',
    integrationCount: 2,
    contact: { name: 'John Doe', email: 'john.doe@globalfood.com' },
  },
  {
    id: 'cl_002',
    name: 'Gourmet Innovations',
    status: 'Active',
    integrationCount: 1,
    contact: { name: 'Jane Smith', email: 'jane.smith@gourmet.com' },
  },
  {
    id: 'cl_003',
    name: 'Quick Eats LLC',
    status: 'Inactive',
    integrationCount: 0,
    contact: { name: 'Jim Brown', email: 'jim.brown@quickeats.com' },
  },
];

export const getClientById = (id: string) => clients.find(c => c.id === id);
export const getIntegrationsByClientId = (clientId: string) => integrations.filter(i => i.clientId === clientId);
export const getIntegrationById = (id: string) => integrations.find(i => i.id === id);

// Resto de los datos...
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

export const netsuiteClasses = [
    { value: 'class_1', label: 'Restaurant' },
    { value: 'class_2', label: 'Retail' },
    { value: 'class_3', label: 'Online' },
];

export const netsuiteDepartments = [
    { value: 'dept_1', label: 'Front of House' },
    { value: 'dept_2', label: 'Back of House' },
    { value: 'dept_3', label: 'Management' },
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
