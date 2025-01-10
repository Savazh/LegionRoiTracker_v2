import { useState, useEffect } from 'react';
import { TokenPrice } from '../types';

interface InvestmentCalculatorProps {
  currentPrice: number | null;
}

export function InvestmentCalculator({ currentPrice }: InvestmentCalculatorProps) {
  const [investment, setInvestment] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState<string>('0.02'); // Default Fuel Network price
  const [results, setResults] = useState<{
    currentValue: number;
    gainLoss: number;
    gainLossPercentage: number;
    tokens: number;
  } | null>(null);

  useEffect(() => {
    if (currentPrice && investment && purchasePrice) {
      const investmentNum = parseFloat(investment);
      const purchasePriceNum = parseFloat(purchasePrice);
      
      if (investmentNum > 0 && purchasePriceNum > 0) {
        const tokens = investmentNum / purchasePriceNum;
        const currentValue = tokens * currentPrice;
        const gainLoss = currentValue - investmentNum;
        const gainLossPercentage = (gainLoss / investmentNum) * 100;

        setResults({
          currentValue,
          gainLoss,
          gainLossPercentage,
          tokens
        });
      }
    }
  }, [investment, purchasePrice, currentPrice]);

  return (
    <div className="bg-black/20 p-6 rounded-lg border border-cyan-500/10">
      <h2 className="text-xl font-semibold text-pink-500 mb-4">Investment Calculator</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-cyan-300 mb-1">
            Investment Amount ($)
          </label>
          <input
            type="number"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            className="w-full px-3 py-2 bg-black/40 border border-cyan-500/20 rounded-md text-cyan-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Enter investment amount"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-cyan-300 mb-1">
            Purchase Price ($)
          </label>
          <input
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            className="w-full px-3 py-2 bg-black/40 border border-cyan-500/20 rounded-md text-cyan-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Enter purchase price"
            min="0"
            step="0.000001"
          />
        </div>

        {results && currentPrice && (
          <div className="mt-6 space-y-2 p-4 bg-black/40 rounded-lg border border-cyan-500/20">
            <p className="text-cyan-300">
              Tokens: <span className="text-pink-400">{results.tokens.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </p>
            <p className="text-cyan-300">
              Current Value: <span className="text-pink-400">${results.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </p>
            <p className="text-cyan-300">
              Gain/Loss:{' '}
              <span className={results.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                ${Math.abs(results.gainLoss).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                {' '}({results.gainLoss >= 0 ? '+' : '-'}{Math.abs(results.gainLossPercentage).toFixed(2)}%)
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}