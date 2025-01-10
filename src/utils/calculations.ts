import { Token, TokenPrice } from '../types';

export function calculateROI(token: Token, prices: TokenPrice): number | null {
  if (token.status !== 'live' || !prices[token.id]) return null;
  
  const currentPrice = prices[token.id].usd;
  const buyPrice = parseFloat(token.buyPrice);
  const multiplier = currentPrice / buyPrice;
  return (multiplier - 1) * 100;
}

export function formatROI(roi: number): string {
  const multiplier = (roi / 100) + 1;
  return `${roi.toFixed(2)}% (${multiplier.toFixed(2)}x)`;
}