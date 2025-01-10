import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { tokens } from '../data/tokens';
import { TokenDetails as ITokenDetails } from '../types';
import { calculateROI, formatROI } from '../utils/calculations';
import { fetchTokenPrice } from '../utils/api';
import { InvestmentCalculator } from './InvestmentCalculator';
import { SocialFeatures } from './SocialFeatures';
import { FallingLogos } from './FallingLogos';
import { PriceChart } from './PriceChart';
import { PriceAlerts } from './PriceAlerts';
import { useAlertStore } from '../store/alertStore';

export function TokenDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<ITokenDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const checkAlerts = useAlertStore((state) => state.checkAlerts);

  const token = tokens.find(t => t.id === id);
  const currentPrice = details?.market_data.current_price.usd || null;

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const fetchDetails = async () => {
      if (token.status !== 'live') {
        setLoading(false);
        return;
      }
      
      try {
        setError(null);
        const priceData = await fetchTokenPrice();
        
        if (priceData['fuel-network']) {
          const price = priceData['fuel-network'].usd;
          setDetails({
            market_data: {
              current_price: {
                usd: price
              }
            }
          });

          // Check price alerts
          if (token.id) {
            const triggeredAlerts = checkAlerts(token.id, price);
            triggeredAlerts.forEach(alert => {
              toast.success(`Price Alert: ${token.name} is ${alert.type} $${alert.price}`, {
                description: `Current price: $${price}`,
                duration: 10000,
              });
            });
          }
        }
        
        setRetryCount(0);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
        
        if (!details) {
          setDetails({
            market_data: {
              current_price: {
                usd: 0.04 // Fallback price
              }
            }
          });
        }
        
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

    fetchDetails();
    const interval = setInterval(fetchDetails, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [token, navigate, retryCount, checkAlerts]);

  if (!token) return null;

  const currentROI = currentPrice 
    ? calculateROI(token, { [token.id]: { usd: currentPrice } })
    : null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Toaster position="top-right" />
      <FallingLogos logoUrl={token.logo} />
      
      <Link to="/" className="flex items-center gap-2 text-cyan-400 hover:text-pink-400 mb-8">
        <ArrowLeft size={20} />
        Back to Overview
      </Link>
      
      <div className="space-y-8">
        <div className="bg-black/40 rounded-xl p-4 md:p-8 backdrop-blur-sm shadow-xl border border-cyan-500/20">
          <div className="flex items-center gap-4 mb-8">
            <img
              src={token.logo}
              alt={`${token.name} logo`}
              className="w-16 h-16 rounded-full ring-2 ring-cyan-500/20"
            />
            <div>
              <h1 className="text-3xl font-bold text-cyan-300">{token.name}</h1>
              <p className="text-pink-400">Sale Date: {token.date}</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-pink-500" />
                <p className="text-pink-500">{error}</p>
              </div>
              <p className="text-cyan-300 text-sm">Using last known price data</p>
            </div>
          )}

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-cyan-500/20 rounded w-1/3"></div>
              <div className="h-8 bg-cyan-500/20 rounded w-1/2"></div>
              <div className="h-8 bg-cyan-500/20 rounded w-2/3"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {token.status === 'live' && (
                  <div className="bg-black/20 p-6 rounded-lg border border-cyan-500/10">
                    <h2 className="text-xl font-semibold text-pink-500 mb-4">Investment Details</h2>
                    <div className="space-y-2">
                      <p>Buy Price: <span className="text-cyan-300">${token.buyPrice}</span></p>
                      {currentPrice && (
                        <p>Current Price: <span className="text-cyan-300">${currentPrice.toFixed(6)}</span></p>
                      )}
                      {currentROI && (
                        <p>Current ROI: <span className={currentROI >= 100 ? 'text-green-400' : 'text-pink-500'}>
                          {formatROI(currentROI)}
                        </span></p>
                      )}
                      {token.unlockPrice && (
                        <p>Unlock Price: <span className="text-cyan-300">${token.unlockPrice}</span></p>
                      )}
                      {token.highestPrice && (
                        <p>ATH Price: <span className="text-cyan-300">${token.highestPrice}</span></p>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-black/20 p-6 rounded-lg border border-cyan-500/10">
                  <h2 className="text-xl font-semibold text-pink-500 mb-4">Links</h2>
                  <div className="space-y-2">
                    {token.links?.website && (
                      <p><a href={token.links.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-pink-400">Website</a></p>
                    )}
                    {token.links?.twitter && (
                      <p><a href={token.links.twitter} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-pink-400">Twitter</a></p>
                    )}
                  </div>
                </div>
              </div>

              {token.status === 'live' && (
                <>
                  <PriceChart tokenId={token.id} currentPrice={currentPrice} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InvestmentCalculator currentPrice={currentPrice} />
                    <PriceAlerts tokenId={token.id} currentPrice={currentPrice} />
                  </div>
                </>
              )}

              {token.about && (
                <div className="bg-black/20 p-6 rounded-lg border border-cyan-500/10">
                  <h2 className="text-xl font-semibold text-pink-500 mb-4">About {token.name}</h2>
                  <p className="text-cyan-100 leading-relaxed">{token.about}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {token.status === 'live' && (
          <>
            <SocialFeatures tokenId={token.id} />
          </>
        )}
      </div>
    </div>
  );
}