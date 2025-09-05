'use client';

import { Calculator, Percent, DollarSign, Minus } from 'lucide-react';

interface TaxDiscountSectionProps {
  subtotal: number;
  taxRate: number;
  discount: number;
  onTaxRateChange: (rate: number) => void;
  onDiscountChange: (discount: number) => void;
}

export default function TaxDiscountSection({
  subtotal,
  taxRate,
  discount,
  onTaxRateChange,
  onDiscountChange
}: TaxDiscountSectionProps) {
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + taxAmount;

  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 glass rounded-lg flex items-center justify-center">
          <Calculator className="h-5 w-5 text-white/80" />
        </div>
        <h3 className="text-lg font-semibold text-white">Invoice Summary</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 glass rounded-lg">
          <span className="text-white/80 font-medium">Subtotal:</span>
          <span className="text-white font-semibold text-lg">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 glass rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 glass rounded-md flex items-center justify-center">
              <Minus className="h-4 w-4 text-red-400" />
            </div>
            <span className="text-white/80 text-sm">Discount:</span>
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-white/50" />
              <input
                type="number"
                value={discount}
                onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                min="0"
                max={subtotal}
                step="0.01"
                className="w-20 pl-6 pr-2 py-1 text-sm glass-input rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400/50"
                placeholder="0.00"
              />
            </div>
          </div>
          <span className="text-red-400 font-medium">-${discount.toFixed(2)}</span>
        </div>


        <div className="flex justify-between items-center p-3 glass rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 glass rounded-md flex items-center justify-center">
              <Percent className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-white/80 text-sm">Tax Rate:</span>
            <div className="relative">
              <input
                type="number"
                value={taxRate}
                onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className="w-20 pr-6 py-1 text-sm glass-input rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                placeholder="0.0"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 text-xs">%</span>
            </div>
          </div>
          <span className="text-blue-400 font-medium">${taxAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-white/20 pt-4">
        <div className="flex justify-between items-center p-4 glass rounded-lg neon-border">
          <span className="text-white font-semibold text-xl">Total:</span>
          <span className="text-white font-bold text-3xl drop-shadow-lg">${total.toFixed(2)}</span>
        </div>
      </div>


    </div>
  );
}
