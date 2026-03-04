import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import ContractsSheet from './components/ContractsSheet';
import ReceiptQC from './components/ReceiptQC';
import TokenManagement from './components/TokenManagement';
import TransporterManagement from './components/TransporterManagement';
import { FileText, ClipboardCheck, LayoutDashboard, Ticket, Factory, User } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'contracts' | 'receipts' | 'transporters'>('tokens');

  return (
    <AppProvider>
      <div className="min-h-screen flex bg-[#F8F9FA]">
        {/* Sidebar */}
        <div className="w-72 bg-zinc-900 flex flex-col text-zinc-300">
          <div className="p-8 border-b border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Factory className="w-6 h-6 text-zinc-900" />
              </div>
              <div>
                <h1 className="font-black text-xl text-white tracking-tighter leading-none">SOYUG</h1>
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-1">Gold Ltd</p>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden relative group h-24">
              <img 
                src="https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=400&auto=format&fit=crop" 
                alt="Plant" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
              <div className="absolute bottom-2 left-3">
                <p className="text-[10px] font-bold text-white uppercase tracking-wider">Solvent Extraction</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1 flex-1">
            <div className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Main Operations</div>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'tokens' 
                  ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' 
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Ticket className="w-4 h-4" />
              Token Management
            </button>
            <button
              onClick={() => setActiveTab('receipts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'receipts' 
                  ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' 
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              Receipt & QC
            </button>
            <button
              onClick={() => setActiveTab('transporters')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'transporters' 
                  ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' 
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Transporter KYC
            </button>
            
            <div className="px-4 py-2 mt-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Master Data</div>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'contracts' 
                  ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' 
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Bargains Sheet
            </button>
          </nav>

          <div className="p-6 mt-auto">
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 h-screen overflow-y-auto flex flex-col">
          <header className="bg-white border-b border-zinc-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Soyug Gold Ltd</span>
              <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Operational Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">System Time</div>
                <div className="text-xs font-bold text-zinc-900">{new Date().toLocaleTimeString()}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                <span className="text-[10px] font-bold text-zinc-600">JD</span>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {activeTab === 'tokens' && <TokenManagement />}
            {activeTab === 'contracts' && <ContractsSheet />}
            {activeTab === 'receipts' && <ReceiptQC />}
            {activeTab === 'transporters' && <TransporterManagement />}
          </main>
        </div>
      </div>
    </AppProvider>
  );
}
