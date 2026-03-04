import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Building2, User, Hash, Truck } from 'lucide-react';

export default function TransporterManagement() {
  const { transporters, addTransporter } = useApp();
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [origin, setOrigin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bankName || !accountNo || !origin) return;
    addTransporter({
      id: Math.random().toString(36).substr(2, 9),
      name,
      bankName,
      accountNo,
      origin
    });
    setName('');
    setBankName('');
    setAccountNo('');
    setOrigin('');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-6">Transporter KYC</h2>
      
      <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input 
            placeholder="Transporter Name" 
            className="border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input 
            placeholder="Bank Name" 
            className="border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            value={bankName}
            onChange={e => setBankName(e.target.value)}
          />
          <input 
            placeholder="Account Number" 
            className="border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            value={accountNo}
            onChange={e => setAccountNo(e.target.value)}
          />
          <input 
            placeholder="Origin (e.g. Bundi)" 
            className="border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            value={origin}
            onChange={e => setOrigin(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800">
          <Plus className="w-4 h-4" />
          Add Transporter
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transporters.map(t => (
          <div key={t.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-zinc-100 p-2 rounded-lg">
                <User className="w-5 h-5 text-zinc-600" />
              </div>
              <div className="font-bold text-zinc-900">{t.name}</div>
            </div>
            <div className="text-xs text-zinc-500 space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-3 h-3" /> {t.bankName}
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-3 h-3" /> {t.accountNo}
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3 h-3" /> {t.origin}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
