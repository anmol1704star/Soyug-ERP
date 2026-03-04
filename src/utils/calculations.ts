import { Contract, Receipt } from '../types';

export function calculateReceipt(
  recdWt: number,
  bags: number,
  moisture: number,
  fm: number,
  damage: number,
  contract: Contract
): Pick<Receipt, 'claimWt' | 'netWt' | 'value'> {
  let claimWt = 0;

  if (contract.qualityCondition === 'Claim') {
    // Moisture above 10 holds claim 1:1
    const moistureClaimPct = moisture > 10 ? (moisture - 10) : 0;
    
    // FM between 2 to 8 holds claim 1:1, below 2 is nil
    // Assuming if it's > 8, it still holds 1:1 for the excess as well, 
    // but the rule specifically said "between 2 to 8". We'll apply 1:1 for anything > 2.
    const fmClaimPct = fm > 2 ? (fm - 2) : 0;
    
    // Damage seed claim is 0.25:1 between 2 to 10, below 2 no claim
    const damageClaimPct = damage > 2 ? (damage - 2) * 0.25 : 0;

    const totalClaimPct = moistureClaimPct + fmClaimPct + damageClaimPct;
    claimWt = recdWt * (totalClaimPct / 100);
  }

  const netWt = recdWt - claimWt;
  const bardanaDeduction = bags * 20;
  const value = (netWt * contract.rate) - bardanaDeduction;

  return {
    claimWt: Number(claimWt.toFixed(3)),
    netWt: Number(netWt.toFixed(3)),
    value: Number(value.toFixed(2))
  };
}
