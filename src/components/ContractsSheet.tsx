import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, CheckCircle, Clock, FileText } from 'lucide-react';
import { Contract } from '../types';

export default function ContractsSheet() {
  const { contracts, updateContractStatus, addContract, getPendingWt } = useApp();
  const [showModal, setShowModal] = useState(false);

  const handleStatusToggle = (poNo: string, currentStatus: string) => {
    updateContractStatus(poNo, currentStatus === 'Pending' ? 'COMPLETE' : 'Pending');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Bargains Sheet</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage purchase orders and active bargains for Soya Seeds.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
        >
          <Plus className="w-4 h-4" />
          New Bargain
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>PO No</th>
                <th>Date</th>
                <th>Party</th>
                <th>Material</th>
                <th>Qty (Max)</th>
                <th>Pending Wt</th>
                <th>Rate</th>
                <th>Quality Cond.</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => {
                const pendingWt = getPendingWt(contract.poNo);
                const isExpired = new Date(contract.dateTo) < new Date();
                return (
                  <tr key={contract.poNo}>
                    <td className="font-bold text-zinc-900">{contract.poNo}</td>
                    <td>{contract.date}</td>
                    <td>
                      <div className="font-bold text-zinc-900">{contract.party}</div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase">{contract.place}</div>
                    </td>
                    <td>
                      <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                        {contract.material}
                      </span>
                    </td>
                    <td className="font-mono-num">{contract.qtyMax.toFixed(3)} MT</td>
                    <td className="font-mono-num text-blue-600 font-bold">{pendingWt.toFixed(3)} MT</td>
                    <td className="font-mono-num font-bold text-zinc-900">₹{contract.rate.toLocaleString()}</td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        contract.qualityCondition === 'Claim' 
                          ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' 
                          : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                      }`}>
                        {contract.qualityCondition}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {contract.status === 'COMPLETE' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Clock className={`w-4 h-4 ${isExpired ? 'text-red-500' : 'text-amber-500'}`} />
                        )}
                        <span className={`text-xs font-bold uppercase ${
                          contract.status === 'COMPLETE' ? 'text-emerald-700' : isExpired ? 'text-red-700' : 'text-amber-700'
                        }`}>
                          {contract.status} {isExpired && contract.status === 'Pending' && '(Expired)'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleStatusToggle(contract.poNo, contract.status)}
                        className="text-[10px] font-bold uppercase text-blue-600 hover:text-blue-800"
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                );
              })}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 text-zinc-200" />
                      <p>No bargains found. Add a new purchase order to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <AddContractModal onClose={() => setShowModal(false)} onAdd={addContract} />
      )}
    </div>
  );
}

function AddContractModal({ onClose, onAdd }: { onClose: () => void, onAdd: (c: Contract) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const newContract: Contract = {
      poNo: fd.get('poNo') as string,
      date: fd.get('date') as string,
      party: fd.get('party') as string,
      place: fd.get('place') as string,
      broker: fd.get('broker') as string,
      qtyMin: Number(fd.get('qtyMin')),
      qtyMax: Number(fd.get('qtyMax')),
      rate: Number(fd.get('rate')),
      dateFrom: fd.get('dateFrom') as string,
      dateTo: fd.get('dateTo') as string,
      delTerm: fd.get('delTerm') as string,
      paymentTerms: fd.get('paymentTerms') as string,
      qualityCondition: fd.get('qualityCondition') as 'Claim' | 'Non-Claim',
      billOn: fd.get('billOn') as string,
      material: fd.get('material') as string,
      status: 'Pending'
    };

    onAdd(newContract);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-zinc-100">
          <h3 className="text-lg font-semibold">Add New Contract</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">PO No</label>
              <input required name="poNo" type="text" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. ITAW-24/01" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Date</label>
              <input required name="date" type="date" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Material</label>
              <select name="material" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm">
                <option value="Soya Seed">Soya Seed</option>
                <option value="GFO">GFO</option>
                <option value="SDOC-N">SDOC-N</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Party</label>
              <input required name="party" type="text" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Place</label>
              <input required name="place" type="text" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Broker</label>
              <input required name="broker" type="text" defaultValue="Direct" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Qty Min (MT)</label>
              <input required name="qtyMin" type="number" step="0.001" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Qty Max (MT)</label>
              <input required name="qtyMax" type="number" step="0.001" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Rate (₹)</label>
              <input required name="rate" type="number" step="0.01" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Date From</label>
              <input required name="dateFrom" type="date" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Date To</label>
              <input required name="dateTo" type="date" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Quality Condition</label>
              <select name="qualityCondition" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm">
                <option value="Non-Claim">Non-Claim</option>
                <option value="Claim">Claim</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Del. Term</label>
              <input required name="delTerm" type="text" defaultValue="Ex" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Payment Terms</label>
              <input required name="paymentTerms" type="text" defaultValue="Payment on 04 Days" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Bill on</label>
              <select name="billOn" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm">
                <option value="Net">Net</option>
                <option value="Gross">Gross</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg">
              Save Contract
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
