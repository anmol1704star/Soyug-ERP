import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Contract, Receipt, Token, Transporter, FreightRate } from '../types';

interface AppContextType {
  contracts: Contract[];
  receipts: Receipt[];
  tokens: Token[];
  transporters: Transporter[];
  freightRates: FreightRate[];
  addContract: (contract: Contract) => void;
  updateContractStatus: (poNo: string, status: 'Pending' | 'COMPLETE') => void;
  updateContractExpiry: (poNo: string, newDateTo: string) => void;
  addReceipt: (receipt: Receipt) => void;
  addToken: (token: Omit<Token, 'tokenNo'>) => number;
  updateToken: (tokenNo: number, updates: Partial<Token>) => void;
  updateTokenStatus: (tokenNo: number, status: string) => void;
  getPendingWt: (poNo: string) => number;
  getBestBargainsForParty: (party: string, currentDate: string) => Contract[];
  addTransporter: (transporter: Transporter) => void;
  deleteToken: (tokenNo: number) => void;
  calculateTransporterPayment: (token: Token) => { freight: number, rebate: number, totalPayable: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialContracts: Contract[] = [
  { poNo: 'ITAW-23/01', date: '2024-01-27', party: 'Itawa Mandi', place: 'Itawa(RJ)', broker: 'Direct', qtyMin: 27.854, qtyMax: 27.854, rate: 46757.81, dateFrom: '2024-01-27', dateTo: '2024-02-03', delTerm: 'Ex', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Non-Claim', billOn: 'Net', material: 'Soya Seed', status: 'COMPLETE' },
  { poNo: 'ITAW-23/02', date: '2024-01-29', party: 'Itawa Mandi', place: 'Itawa(RJ)', broker: 'Direct', qtyMin: 9.570, qtyMax: 9.570, rate: 46247.65, dateFrom: '2024-01-29', dateTo: '2024-02-05', delTerm: 'Ex', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Non-Claim', billOn: 'Net', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'ITAW-23/03', date: '2024-01-30', party: 'Itawa Mandi', place: 'Itawa(RJ)', broker: 'Direct', qtyMin: 42.982, qtyMax: 42.982, rate: 45704.07, dateFrom: '2024-01-30', dateTo: '2024-02-06', delTerm: 'Ex', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Non-Claim', billOn: 'Net', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'ITAW-23/04', date: '2024-01-31', party: 'Itawa Mandi', place: 'Itawa(RJ)', broker: 'Direct', qtyMin: 22.222, qtyMax: 22.222, rate: 46163.55, dateFrom: '2024-01-31', dateTo: '2024-02-07', delTerm: 'Ex', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Non-Claim', billOn: 'Net', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'ITAW-23/05', date: '2024-02-01', party: 'Itawa Mandi', place: 'Itawa(RJ)', broker: 'Direct', qtyMin: 30.042, qtyMax: 30.042, rate: 46209.37, dateFrom: '2024-02-01', dateTo: '2024-02-08', delTerm: 'Ex', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Non-Claim', billOn: 'Net', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'ITAW-23/06', date: '2024-02-02', party: 'Itawa Mandi', place: 'Itawa(RJ)', broker: 'Direct', qtyMin: 35.325, qtyMax: 35.325, rate: 46137.95, dateFrom: '2024-02-02', dateTo: '2024-02-09', delTerm: 'Ex', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Non-Claim', billOn: 'Net', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'ITAW-23/07', date: '2024-02-03', party: 'Itawa Mandi', place: 'Itawa(RJ)', broker: 'Direct', qtyMin: 9.492, qtyMax: 9.492, rate: 45818.80, dateFrom: '2024-02-03', dateTo: '2024-02-10', delTerm: 'Ex', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Non-Claim', billOn: 'Net', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'ITAW-23/08', date: '2024-02-09', party: 'Itawa Mandi', place: 'Itawa(RJ)', broker: 'Direct', qtyMin: 12.740, qtyMax: 12.740, rate: 46498.36, dateFrom: '2024-02-09', dateTo: '2024-02-16', delTerm: 'Ex', paymentTerms: 'Payment on 01 Days', qualityCondition: 'Non-Claim', billOn: 'Net', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2793', date: '2025-03-01', party: 'Surbhi Trading Company', place: 'Bundi(RJ)', broker: 'Dhan Laxmi Traders', qtyMin: 30.000, qtyMax: 30.000, rate: 41750.00, dateFrom: '2025-03-01', dateTo: '2025-03-08', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2883', date: '2025-03-10', party: 'Surbhi Trading Company', place: 'Bundi(RJ)', broker: 'Dhan Laxmi Traders', qtyMin: 18.000, qtyMax: 18.000, rate: 41500.00, dateFrom: '2025-03-10', dateTo: '2025-03-17', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2891', date: '2025-03-12', party: 'Surbhi Trading Company', place: 'Bundi(RJ)', broker: 'Dhan Laxmi Traders', qtyMin: 2.500, qtyMax: 2.500, rate: 41250.00, dateFrom: '2025-03-12', dateTo: '2025-03-19', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-25/277', date: '2025-05-15', party: 'Surbhi Trading Company', place: 'Bundi(RJ)', broker: 'Dhan Laxmi Traders', qtyMin: 26.000, qtyMax: 26.000, rate: 43750.00, dateFrom: '2025-05-15', dateTo: '2025-05-22', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-25/387', date: '2025-06-16', party: 'Surbhi Trading Company', place: 'Bundi(RJ)', broker: 'Dhan Laxmi Traders', qtyMin: 28.000, qtyMax: 28.000, rate: 43750.00, dateFrom: '2025-06-16', dateTo: '2025-06-23', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-25/465', date: '2025-07-04', party: 'Surbhi Trading Company', place: 'Bundi(RJ)', broker: 'Dhan Laxmi Traders', qtyMin: 25.000, qtyMax: 25.000, rate: 43750.00, dateFrom: '2025-07-04', dateTo: '2025-07-11', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-25/1069', date: '2025-11-12', party: 'Surbhi Trading Company', place: 'Bundi(RJ)', broker: 'Dhan Laxmi Traders', qtyMin: 25.000, qtyMax: 25.000, rate: 48000.00, dateFrom: '2025-11-12', dateTo: '2025-11-19', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-25/1337', date: '2025-12-13', party: 'Surbhi Trading Company', place: 'Bundi(RJ)', broker: 'Dhan Laxmi Traders', qtyMin: 50.000, qtyMax: 50.000, rate: 46500.00, dateFrom: '2025-12-13', dateTo: '2025-12-20', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-25/1591', date: '2026-01-08', party: 'Surbhi Trading Company', place: 'Bundi(RJ)', broker: 'Dhan Laxmi Traders', qtyMin: 50.000, qtyMax: 50.000, rate: 52000.00, dateFrom: '2026-01-08', dateTo: '2026-01-15', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2794', date: '2025-03-01', party: 'DOLATRAM JETHARAM AND CO', place: 'Junagadh(GJ)', broker: 'Arya Brokers Junagarh', qtyMin: 34.000, qtyMax: 36.000, rate: 42500.00, dateFrom: '2025-03-01', dateTo: '2025-03-08', delTerm: 'FOR', paymentTerms: 'GJ Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2795', date: '2025-03-01', party: 'Radhakrushna Trading Co', place: 'Junagadh(GJ)', broker: 'Arya Brokers Junagarh', qtyMin: 38.000, qtyMax: 40.000, rate: 42500.00, dateFrom: '2025-03-01', dateTo: '2025-03-08', delTerm: 'FOR', paymentTerms: 'GJ Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2796', date: '2025-03-01', party: 'Vivek Enterprises Junagarh', place: 'Junagadh(GJ)', broker: 'Arya Brokers Junagarh', qtyMin: 70.000, qtyMax: 75.000, rate: 42500.00, dateFrom: '2025-03-01', dateTo: '2025-03-08', delTerm: 'FOR', paymentTerms: 'GJ Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2797', date: '2025-03-01', party: 'Gelkrupa Trading Company', place: 'Rajkot(GJ)', broker: 'Arya Brokers Junagarh', qtyMin: 35.000, qtyMax: 40.000, rate: 42500.00, dateFrom: '2025-03-01', dateTo: '2025-03-08', delTerm: 'FOR', paymentTerms: 'GJ Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2798', date: '2025-03-01', party: 'Chamunda Krupa Trading Co', place: 'Junagadh(GJ)', broker: 'Arya Brokers Junagarh', qtyMin: 34.000, qtyMax: 36.000, rate: 42500.00, dateFrom: '2025-03-01', dateTo: '2025-03-08', delTerm: 'FOR', paymentTerms: 'GJ Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2799', date: '2025-03-01', party: 'Shah Mathuralal Shankarlal', place: 'Pratapgarh(RJ)', broker: 'Direct', qtyMin: 35.000, qtyMax: 35.000, rate: 41750.00, dateFrom: '2025-03-01', dateTo: '2025-03-08', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2800', date: '2025-03-01', party: 'Vijaya Traders', place: 'Pratapgarh(RJ)', broker: 'Direct', qtyMin: 65.000, qtyMax: 65.000, rate: 41750.00, dateFrom: '2025-03-01', dateTo: '2025-03-08', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2801', date: '2025-03-01', party: 'Memon Brothers', place: 'Junagadh(GJ)', broker: 'Vipul Broker', qtyMin: 33.000, qtyMax: 36.000, rate: 42500.00, dateFrom: '2025-03-01', dateTo: '2025-03-08', delTerm: 'FOR', paymentTerms: 'GJ Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2802', date: '2025-03-01', party: 'Ashok Kumar Anil Kumar Jain Susner', place: 'Susner(MP)', broker: 'Kamlesh Kumar Gupta Huf', qtyMin: 51.000, qtyMax: 51.000, rate: 42250.00, dateFrom: '2025-03-01', dateTo: '2025-03-08', delTerm: 'FOR', paymentTerms: 'MP Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2803', date: '2025-03-01', party: 'KEDAR TRADERS', place: 'Junagadh(GJ)', broker: 'Direct', qtyMin: 35.400, qtyMax: 35.400, rate: 41410.00, dateFrom: '2025-03-01', dateTo: '2025-03-08', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Non-Claim', billOn: 'Net', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2804', date: '2025-03-01', party: 'KEDAR TRADERS', place: 'Junagadh(GJ)', broker: 'Direct', qtyMin: 95.000, qtyMax: 100.000, rate: 41820.00, dateFrom: '2025-03-01', dateTo: '2025-03-08', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Non-Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2807', date: '2025-03-01', party: 'Govinda Grains Trading Private Limited', place: 'Rajgarh(MP)', broker: 'Direct', qtyMin: 35.720, qtyMax: 35.720, rate: 41955.00, dateFrom: '2025-03-01', dateTo: '2025-03-08', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Net', material: 'Soya Seed', status: 'Pending' },
  { poNo: 'SS-24/2808', date: '2025-03-03', party: 'Dug Depo', place: 'Dug(RJ)', broker: 'Dalal Nakoda Canvassing', qtyMin: 40.000, qtyMax: 40.000, rate: 33000.00, dateFrom: '2025-03-03', dateTo: '2025-03-10', delTerm: 'FOR', paymentTerms: 'Payment on 04 Days', qualityCondition: 'Claim', billOn: 'Gross', material: 'Soya Seed', status: 'Pending' },
];

const initialFreightRates: FreightRate[] = [
  { origin: 'Bundi', ratePerMt: 350 },
  { origin: 'Kota', ratePerMt: 550 },
  { origin: 'Asnawar', ratePerMt: 750 },
  { origin: 'Nimbahera', ratePerMt: 900 },
  { origin: 'Dei', ratePerMt: 950 },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [freightRates] = useState<FreightRate[]>(initialFreightRates);

  const getPendingWt = (poNo: string) => {
    const contract = contracts.find(c => c.poNo === poNo);
    if (!contract) return 0;
    const totalRecdWt = receipts.filter(r => r.poNo === poNo).reduce((sum, r) => sum + r.recdWt, 0);
    return Math.max(0, contract.qtyMax - totalRecdWt);
  };

  const addContract = (contract: Contract) => {
    setContracts(prev => [contract, ...prev]);
  };

  const updateContractStatus = (poNo: string, status: 'Pending' | 'COMPLETE') => {
    setContracts(prev => prev.map(c => c.poNo === poNo ? { ...c, status } : c));
  };

  const updateContractExpiry = (poNo: string, newDateTo: string) => {
    setContracts(prev => prev.map(c => c.poNo === poNo ? { ...c, dateTo: newDateTo } : c));
  };

  const addReceipt = (receipt: Receipt) => {
    setReceipts(prev => [receipt, ...prev]);
  };

  const addToken = (tokenData: Omit<Token, 'tokenNo'>) => {
    const nextTokenNo = tokens.length > 0 ? Math.max(...tokens.map(t => t.tokenNo)) + 1 : 1;
    const newToken: Token = { ...tokenData, tokenNo: nextTokenNo };
    setTokens(prev => [...prev, newToken]);
    return nextTokenNo;
  };

  const updateToken = (tokenNo: number, updates: Partial<Token>) => {
    setTokens(prev => prev.map(t => t.tokenNo === tokenNo ? { ...t, ...updates } : t));
  };

  const updateTokenStatus = (tokenNo: number, status: string) => {
    setTokens(prev => prev.map(t => t.tokenNo === tokenNo ? { ...t, status: status as any } : t));
  };

  const deleteToken = (tokenNo: number) => {
    setTokens(prev => prev.filter(t => t.tokenNo !== tokenNo));
  };

  const addTransporter = (transporter: Transporter) => {
    setTransporters(prev => [...prev, transporter]);
  };

  const getBestBargainsForParty = (party: string, currentDate: string) => {
    const partyContracts = contracts.filter(c => c.party === party && c.status === 'Pending');
    const valid = partyContracts.filter(c => new Date(c.dateTo) >= new Date(currentDate));
    const expired = partyContracts.filter(c => new Date(c.dateTo) < new Date(currentDate));

    if (valid.length > 0) return valid;
    if (expired.length > 0) {
      const cheapest = expired.reduce((prev, curr) => prev.rate < curr.rate ? prev : curr);
      return [cheapest];
    }
    return [];
  };

  const calculateTransporterPayment = (token: Token) => {
    const freightRate = freightRates.find(f => f.origin === token.origin)?.ratePerMt || 0;
    const netWt = (token.weight1 || 0) - (token.weight2 || 0);
    const freight = netWt * freightRate;
    
    // Find receipt to get actual received weight
    const receipt = receipts.find(r => r.tokenNo === token.tokenNo);
    const recdWt = receipt?.recdWt || netWt;
    const shortage = Math.max(0, netWt - recdWt);
    
    // Shortage allowed is 0.2% of netWt (unload weight)
    const allowedShortage = netWt * 0.002;
    const excessShortage = Math.max(0, shortage - allowedShortage);
    
    // Deduct rebate based on contract rate (using first bargain rate as placeholder)
    const contract = contracts.find(c => token.selectedBargains.includes(c.poNo));
    const rate = contract?.rate || 0;
    const rebate = excessShortage * rate;

    return {
      freight,
      rebate,
      totalPayable: freight - rebate
    };
  };

  return (
    <AppContext.Provider value={{ 
      contracts, 
      receipts, 
      tokens, 
      transporters,
      freightRates,
      addContract, 
      updateContractStatus, 
      updateContractExpiry,
      addReceipt, 
      addToken, 
      updateToken,
      updateTokenStatus,
      deleteToken,
      getPendingWt,
      getBestBargainsForParty,
      addTransporter,
      calculateTransporterPayment
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
