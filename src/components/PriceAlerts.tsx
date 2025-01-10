import { useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { useAlertStore } from '../store/alertStore';

interface PriceAlertsProps {
  tokenId: string;
  currentPrice: number | null;
}

export function PriceAlerts({ tokenId, currentPrice }: PriceAlertsProps) {
  const [price, setPrice] = useState<string>('');
  const [type, setType] = useState<'above' | 'below'>('above');
  const { alerts, addAlert, removeAlert } = useAlertStore();

  const tokenAlerts = alerts.filter(alert => alert.tokenId === tokenId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice) && numericPrice > 0) {
      addAlert({
        tokenId,
        price: numericPrice,
        type
      });
      setPrice('');
    }
  };

  return (
    <div className="bg-black/20 p-6 rounded-lg border border-cyan-500/10">
      <h2 className="text-xl font-semibold text-pink-500 mb-4 flex items-center gap-2">
        <Bell size={20} />
        Price Alerts
      </h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="flex gap-4">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            step="0.000001"
            min="0"
            className="flex-1 px-3 py-2 bg-black/40 border border-cyan-500/20 rounded-md text-cyan-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'above' | 'below')}
            className="px-3 py-2 bg-black/40 border border-cyan-500/20 rounded-md text-cyan-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
        >
          Add Alert
        </button>
      </form>

      {tokenAlerts.length > 0 ? (
        <div className="space-y-3">
          {tokenAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                alert.triggered
                  ? 'bg-green-500/20 border-green-500/30'
                  : 'bg-black/40 border-cyan-500/20'
              } border`}
            >
              <div>
                <p className="text-cyan-300">
                  Alert when price goes{' '}
                  <span className="text-pink-400">{alert.type}</span>{' '}
                  <span className="font-mono">${alert.price.toFixed(6)}</span>
                </p>
                <p className="text-sm text-cyan-300/60">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="p-2 text-cyan-300 hover:text-pink-400 transition-colors"
                title="Remove alert"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-cyan-300/60">No alerts set</p>
      )}
    </div>
  );
}