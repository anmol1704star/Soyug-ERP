import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Truck, Calendar, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { Contract } from '../types';

export default function TokenManagement() {
  const { tokens, contracts, addToken, getBestBargainsForParty } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTokens = tokens.filter(t => 
    t.truckNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tokenNo.toString().includes(searchTerm)
  ).sort((a, b) => b.tokenNo - a.tokenNo);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Token Management</h2>
          <p className="text-sm text-zinc-500 mt-1">Issue and track truck entry tokens.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Issue New Token
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Search by Token, Truck or Party..." 
          className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTokens.map((token) => (
          <div key={token.tokenNo} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-zinc-100 text-zinc-900 text-xs font-bold px-2 py-1 rounded">
                  TOKEN #{token.tokenNo}
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  token.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                  token.status === 'QC_Pending' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {token.status.replace('_', ' ')}
                </span>
              </div>
              <Calendar className="w-4 h-4 text-zinc-400" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-zinc-500" />
                <span className="font-bold text-zinc-900">{token.truckNo}</span>
              </div>
              <div className="text-sm font-medium text-zinc-700">{token.party}</div>
              <div className="text-xs text-zinc-500">Issued: {token.date}</div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-100">
              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Linked Bargains</div>
              <div className="flex flex-wrap gap-1">
                {token.selectedBargains.map(po => (
                  <span key={po} className="bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-0.5 rounded border border-blue-100">
                    {po}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filteredTokens.length === 0 && (
          <div className="col-span-full py-12 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
            <AlertCircle className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No tokens found matching your search.</p>
          </div>
        )}
      </div>

      {showModal && (
        <IssueTokenModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

function IssueTokenModal({ onClose }: { onClose: () => void }) {
  const { contracts, addToken, getBestBargainsForParty } = useApp();
  const [truckNo, setTruckNo] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  const [selectedBargains, setSelectedBargains] = useState<string[]>([]);

  const parties = useMemo(() => {
    const p = new Set<string>();
    contracts.forEach(c => {
      if (c.status === 'Pending') p.add(c.party);
    });
    return Array.from(p).sort();
  }, [contracts]);

  const bestBargains = useMemo(() => {
    if (!selectedParty) return [];
    return getBestBargainsForParty(selectedParty, new Date().toISOString().split('T')[0]);
  }, [selectedParty, getBestBargainsForParty]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!truckNo || !selectedParty || selectedBargains.length === 0) return;

    addToken({
      date: new Date().toISOString().split('T')[0],
      truckNo: truckNo.toUpperCase(),
      party: selectedParty,
      status: 'QC_Pending',
      selectedBargains
    });
    onClose();
  };

  const toggleBargain = (poNo: string) => {
    setSelectedBargains(prev => 
      prev.includes(poNo) ? prev.filter(id => id !== poNo) : [...prev, poNo]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Issue Entry Token</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Truck Number</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. RJ-14-GA-1234"
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm uppercase"
                value={truckNo}
                onChange={e => setTruckNo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Select Party</label>
              <select 
                required 
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white"
                value={selectedParty}
                onChange={e => {
                  setSelectedParty(e.target.value);
                  setSelectedBargains([]);
                }}
              >
                <option value="">-- Select Party --</option>
                {parties.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {selectedParty && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-zinc-900">Select Bargains (POs)</h4>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Auto-selected best deals</span>
              </div>
              
              <div className="space-y-2">
                {bestBargains.map(b => {
                  const isExpired = new Date(b.dateTo) < new Date();
                  return (
                    <div 
                      key={b.poNo}
                      onClick={() => toggleBargain(b.poNo)}
                      className={`cursor-pointer border rounded-xl p-3 transition-all ${
                        selectedBargains.includes(b.poNo) 
                          ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900' 
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-zinc-900">{b.poNo}</span>
                            {isExpired && (
                              <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-100">
                                EXPIRED
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500 mt-1">
                            Valid till: {b.dateTo} | Pending: {b.qtyMax.toFixed(2)} MT
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-zinc-900">₹{b.rate.toLocaleString()}</div>
                          <div className="text-[10px] text-zinc-400 uppercase font-bold">Per Ton</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {bestBargains.length === 0 && (
                  <div className="text-center py-4 text-zinc-500 text-sm italic">
                    No active or eligible bargains found for this party.
                  </div>
                )}
              </div>
            </div>
          )}
        </form>

        <div className="p-6 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 rounded-lg">
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!truckNo || !selectedParty || selectedBargains.length === 0}
            className="px-6 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-200"
          >
            Issue Token
          </button>
        </div>
      </div>
    </div>
  );
}
