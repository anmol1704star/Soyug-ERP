export interface Contract {
  poNo: string;
  date: string;
  party: string;
  place: string;
  broker: string;
  qtyMin: number;
  qtyMax: number;
  rate: number;
  dateFrom: string;
  dateTo: string;
  delTerm: string;
  paymentTerms: string;
  qualityCondition: 'Claim' | 'Non-Claim';
  billOn: string;
  material: string;
  status: 'Pending' | 'COMPLETE';
}

export interface Token {
  tokenNo: number;
  date: string;
  truckNo: string;
  party: string;
  status: 'Draft' | 'QC_Pending' | 'Completed';
  selectedBargains: string[]; // poNo list
}

export interface Receipt {
  id: string;
  tokenNo: number;
  poNo: string;
  date: string;
  truckNo: string;
  recdWt: number;
  bags: number;
  moisture: number;
  fm: number;
  damage: number;
  // Calculated fields
  claimWt: number;
  netWt: number;
  value: number;
}
