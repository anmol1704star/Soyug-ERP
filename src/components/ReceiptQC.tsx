import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Calculator, ArrowRight, X, Ticket } from 'lucide-react';
import { Receipt, Token } from '../types';
import { calculateReceipt } from '../utils/calculations';

export default function ReceiptQC() {
  const { receipts, tokens, transporters, addReceipt, updateTokenStatus } = useApp();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Receipt QC</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage incoming material and quality claims based on issued tokens.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
        >
          <Plus className="w-4 h-4" />
          Perform QC (Select Token)
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Token #</th>
                <th>Receipt ID</th>
                <th>Truck No</th>
                <th>Transporter</th>
                <th>PO No</th>
                <th>Date</th>
                <th>Recd Wt (MT)</th>
                <th>Quality (M/F/D)</th>
                <th>Net Wt</th>
                <th>Final Value</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => (
                <tr key={receipt.id}>
                  <td>
                    <span className="bg-zinc-100 text-zinc-900 text-[10px] font-bold px-2 py-1 rounded">
                      #{receipt.tokenNo}
                    </span>
                  </td>
                  <td className="font-medium text-zinc-900">{receipt.id}</td>
                  <td className="font-bold text-zinc-900">{receipt.truckNo}</td>
                  <td className="text-zinc-600 font-medium">{receipt.transporterName}</td>
                  <td className="text-blue-600 font-medium">{receipt.poNo}</td>
                  <td>{receipt.date}</td>
                  <td className="font-mono-num">{receipt.recdWt.toFixed(3)}</td>
                  <td className="font-mono-num text-[10px] text-zinc-500">
                    M:{receipt.moisture}% | F:{receipt.fm}% | D:{receipt.damage}%
                  </td>
                  <td className="font-mono-num font-medium text-emerald-600">{receipt.netWt.toFixed(3)}</td>
                  <td className="font-mono-num font-semibold">₹{receipt.value.toLocaleString()}</td>
                </tr>
              ))}
              {receipts.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <Ticket className="w-8 h-8 text-zinc-200" />
                      <p>No QC receipts found. Issue a token and perform QC to see results here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <AddReceiptModal 
          onClose={() => setShowModal(false)} 
          onAdd={(r) => addReceipt(r)} 
          onCompleteToken={(tokenNo) => updateTokenStatus(tokenNo, 'Completed')}
        />
      )}
    </div>
  );
}

function AddReceiptModal({ onClose, onAdd, onCompleteToken }: { 
  onClose: () => void, 
  onAdd: (r: Receipt) => void,
  onCompleteToken: (tokenNo: number) => void
}) {
  const { contracts, tokens, transporters, getPendingWt } = useApp();
  
  const [selectedTokenNo, setSelectedTokenNo] = useState<number | ''>('');
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recdWt, setRecdWt] = useState<number | ''>('');
  const [bags, setBags] = useState<number | ''>('');
  const [moisture, setMoisture] = useState<number | ''>('');
  const [fm, setFm] = useState<number | ''>('');
  const [damage, setDamage] = useState<number | ''>('');

  const pendingTokens = useMemo(() => {
    return tokens.filter(t => t.status === 'QC_Pending');
  }, [tokens]);

  const selectedToken = useMemo(() => {
    return tokens.find(t => t.tokenNo === selectedTokenNo);
  }, [tokens, selectedTokenNo]);

  const splitData = useMemo(() => {
    if (!selectedToken || recdWt === '' || bags === '' || moisture === '' || fm === '' || damage === '') {
      return null;
    }

    let remainingWt = Number(recdWt);
    const totalBags = Number(bags);
    const m = Number(moisture);
    const f = Number(fm);
    const d = Number(damage);

    const results = [];
    const queue = selectedToken.selectedBargains;

    for (let i = 0; i < queue.length; i++) {
      const poNo = queue[i];
      const contract = contracts.find(c => c.poNo === poNo);
      if (!contract) continue;

      const pending = getPendingWt(poNo);
      
      let allocatedWt = 0;
      if (i === queue.length - 1) {
        allocatedWt = remainingWt;
      } else {
        allocatedWt = Math.min(remainingWt, pending);
      }

      remainingWt -= allocatedWt;
      const allocatedBags = i === 0 ? totalBags : 0;

      if (allocatedWt > 0) {
        const calc = calculateReceipt(allocatedWt, allocatedBags, m, f, d, contract);
        results.push({ poNo, wt: allocatedWt, bags: allocatedBags, calc, contract });
      }
    }

    return results;
  }, [selectedToken, contracts, recdWt, bags, moisture, fm, damage, getPendingWt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!splitData || splitData.length === 0 || !selectedToken) return;

    const m = Number(moisture);
    const f = Number(fm);
    const d = Number(damage);

    const baseId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const transporter = transporters.find(t => t.id === selectedToken.transporterId);
    const transporterName = transporter ? transporter.name : 'Unknown';

    splitData.forEach((data, index) => {
      onAdd({
        id: `REC-${baseId}-${String.fromCharCode(65 + index)}`,
        tokenNo: selectedToken.tokenNo,
        poNo: data.poNo,
        truckNo: selectedToken.truckNo,
        date,
        recdWt: data.wt,
        bags: data.bags,
        moisture: m,
        fm: f,
        damage: d,
        transporterName,
        ...data.calc
      });
    });

    onCompleteToken(selectedToken.tokenNo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
          <h3 className="text-lg font-semibold text-zinc-900">Perform QC & Receipt</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <form id="receipt-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">1. Select Active Token</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Select Token</label>
                  <select 
                    required 
                    value={selectedTokenNo} 
                    onChange={(e) => setSelectedTokenNo(e.target.value ? Number(e.target.value) : '')}
                    className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-zinc-900 outline-none"
                  >
                    <option value="">-- Select Pending Token --</option>
                    {pendingTokens.map(t => (
                      <option key={t.tokenNo} value={t.tokenNo}>
                        Token #{t.tokenNo} - {t.truckNo} ({t.party})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedToken && (
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 flex flex-col justify-center">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase">Linked Party</div>
                    <div className="text-sm font-bold text-zinc-900">{selectedToken.party}</div>
                  </div>
                )}
              </div>

              {selectedToken && (
                <div className="mt-4">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Linked Bargains for this Truck</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedToken.selectedBargains.map((poNo) => {
                      const contract = contracts.find(c => c.poNo === poNo);
                      return (
                        <div key={poNo} className="bg-white border border-zinc-200 px-3 py-2 rounded-xl shadow-sm flex items-center gap-3">
                          <span className="font-bold text-xs text-zinc-900">{poNo}</span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">₹{contract?.rate}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-full">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-blue-500" />
                  <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">2. Weighment & Quality</h4>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase">Receipt Date</label>
                <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase">Total Recd Wt (MT)</label>
                <input required type="number" step="0.001" value={recdWt} onChange={e => setRecdWt(e.target.value ? Number(e.target.value) : '')} className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="0.000" />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase">Total Bags</label>
                <input required type="number" value={bags} onChange={e => setBags(e.target.value ? Number(e.target.value) : '')} className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="0" />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase">Moisture (%)</label>
                <input required type="number" step="0.01" value={moisture} onChange={e => setMoisture(e.target.value ? Number(e.target.value) : '')} className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase">Foreign Matter (%)</label>
                <input required type="number" step="0.01" value={fm} onChange={e => setFm(e.target.value ? Number(e.target.value) : '')} className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase">Damage Seed (%)</label>
                <input required type="number" step="0.01" value={damage} onChange={e => setDamage(e.target.value ? Number(e.target.value) : '')} className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="0.00" />
              </div>
            </div>

            {splitData && splitData.length > 0 && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-2 text-zinc-900">
                  <ArrowRight className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-sm font-bold uppercase tracking-wider">3. Settlement Preview</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {splitData.map((data, idx) => (
                    <div key={data.poNo} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
                      <div className="bg-zinc-900 text-white p-4 flex flex-col justify-center items-center md:w-32">
                        <span className="text-[10px] font-bold uppercase opacity-60">Bargain</span>
                        <span className="font-bold text-sm">{data.poNo}</span>
                      </div>
                      <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-50/50">
                        <div>
                          <div className="text-[10px] font-bold text-zinc-400 uppercase">Allocated</div>
                          <div className="text-sm font-bold text-zinc-900">{data.wt.toFixed(3)} MT</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-zinc-400 uppercase">Claim Wt</div>
                          <div className="text-sm font-bold text-amber-600">{data.calc.claimWt.toFixed(3)} MT</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-zinc-400 uppercase">Net Wt</div>
                          <div className="text-sm font-bold text-emerald-600">{data.calc.netWt.toFixed(3)} MT</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-zinc-400 uppercase">Value</div>
                          <div className="text-sm font-bold text-zinc-900">₹{data.calc.value.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-zinc-100 flex justify-end gap-3 bg-white">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button 
            type="submit" 
            form="receipt-form" 
            disabled={!splitData || splitData.length === 0} 
            className="px-8 py-2.5 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-200 transition-all active:scale-95"
          >
            Finalize QC & Save
          </button>
        </div>
      </div>
    </div>
  );
}
