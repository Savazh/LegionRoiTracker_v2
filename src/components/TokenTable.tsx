import { useEffect, useState } from 'react';
import { Token, TokenPrice } from '../types';
import { tokens } from '../data/tokens';
import { calculateROI, formatROI } from '../utils/calculations';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchTokenPrice } from '../utils/api';

// Fallback price data for when API fails
const FALLBACK_PRICES: TokenPrice = {
  'fuel-network': { usd: 0.04 }
};

export function TokenTable() {
  const [prices, setPrices] = useState<TokenPrice>(FALLBACK_PRICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setError(null);
        const data = await fetchTokenPrice();
        setPrices(data);
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error('Error fetching prices:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch prices');
        
        // Retry logic with exponential backoff
        if (retryCount < 3) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Fetch every 30 seconds
    return () => clearInterval(interval);
  }, [retryCount]);

  const getStatusColor = (status: Token['status']) => {
    switch (status) {
      case 'live': return 'text-green-400';
      case 'pending': return 'text-pink-400';
      case 'upcoming': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  if (error) {
    return (
      <div className="text-center p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertTriangle className="text-pink-500" />
          <p className="text-pink-500">{error}</p>
        </div>
        <p className="text-cyan-300 text-sm">Using last known prices</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-cyan-500/20">
            <th className="p-4 text-center text-pink-500">Token</th>
            <th className="p-4 text-pink-500">Logo</th>
            <th className="p-4 text-pink-500">Date</th>
            <th className="p-4 text-pink-500">Buy Price</th>
            <th className="p-4 text-pink-500">Current Price</th>
            <th className="p-4 text-pink-500">Current ROI</th>
            <th className="p-4 text-pink-500">Unlock ROI</th>
            <th className="p-4 text-pink-500">ATH ROI</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => {
            const roi = calculateROI(token, prices);
            const currentPrice = token.status === 'live' ? prices[token.id]?.usd : null;
            const unlockRoi = token.unlockPrice ? calculateROI(token, { [token.id]: { usd: parseFloat(token.unlockPrice) } }) : null;
            const athRoi = token.highestPrice ? calculateROI(token, { [token.id]: { usd: parseFloat(token.highestPrice) } }) : null;

            return (
              <tr
                key={token.id}
                className="border-b border-cyan-500/20 hover:bg-cyan-500/5 transition-colors"
              >
                <td className="text-center p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link 
                      to={`/token/${token.id}`}
                      className="text-cyan-400 hover:text-pink-400 transition-colors"
                    >
                      {token.name}
                    </Link>
                    {token.link && (
                      <a
                        href={token.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-pink-400 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <img
                    src={token.logo}
                    alt={`${token.name} logo`}
                    className="w-8 h-8 rounded-full mx-auto ring-1 ring-cyan-500/20"
                  />
                </td>
                <td className="text-center p-4">{token.date}</td>
                <td className="text-center p-4">${token.buyPrice}</td>
                <td className="text-center p-4">
                  {token.status === 'live' ? (
                    loading ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      currentPrice ? (
                        `$${currentPrice.toFixed(6)}`
                      ) : (
                        'N/A'
                      )
                    )
                  ) : (
                    <span className={getStatusColor(token.status)}>
                      {token.status === 'pending' ? 'Pending TGE' : 'Upcoming ICO'}
                    </span>
                  )}
                </td>
                <td className="text-center p-4">
                  {token.status === 'live' ? (
                    loading ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      roi ? (
                        <span className={roi >= 100 ? 'text-green-400' : 'text-pink-500'}>
                          {formatROI(roi)}
                        </span>
                      ) : (
                        'N/A'
                      )
                    )
                  ) : (
                    <span className={getStatusColor(token.status)}>
                      {token.status === 'pending' ? 'Pending TGE' : 'Upcoming ICO'}
                    </span>
                  )}
                </td>
                <td className="text-center p-4">
                  {unlockRoi && (
                    <span className={unlockRoi >= 100 ? 'text-green-400' : 'text-pink-500'}>
                      {formatROI(unlockRoi)}
                    </span>
                  )}
                </td>
                <td className="text-center p-4">
                  {athRoi && (
                    <span className="text-green-400">
                      {formatROI(athRoi)}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}