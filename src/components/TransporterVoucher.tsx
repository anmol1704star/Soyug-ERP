import React from 'react';
import { useApp } from '../context/AppContext';
import { Token } from '../types';
import { Printer } from 'lucide-react';

export default function TransporterVoucher({ token, onClose }: { token: Token, onClose: () => void }) {
  const { transporters, calculateTransporterPayment } = useApp();
  const transporter = transporters.find(t => t.id === token.transporterId);
  const payment = calculateTransporterPayment(token);

  if (!transporter) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Transporter Voucher</h2>
          <button onClick={() => window.print()} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4 border-b pb-4">
            <div><p className="text-zinc-500">Transporter</p><p className="font-bold">{transporter.name}</p></div>
            <div><p className="text-zinc-500">Bank</p><p className="font-bold">{transporter.bankName}</p></div>
            <div><p className="text-zinc-500">Account No</p><p className="font-bold">{transporter.accountNo}</p></div>
            <div><p className="text-zinc-500">Truck No</p><p className="font-bold">{token.truckNo}</p></div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between"><span>Freight</span><span>₹{payment.freight.toFixed(2)}</span></div>
            <div className="flex justify-between text-red-600"><span>Rebate</span><span>-₹{payment.rebate.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total Payable</span><span>₹{payment.totalPayable.toFixed(2)}</span></div>
          </div>
        </div>

        <button onClick={onClose} className="mt-8 w-full bg-zinc-900 text-white py-2 rounded-lg">Close</button>
      </div>
    </div>
  );
}
