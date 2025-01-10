import { TokenPrice, CandlestickData } from '../types';

const BYBIT_API = 'https://api.bybit.com/v5/market';
const FALLBACK_PRICE = 0.04;
let lastValidPrice: number | null = null;

const cache: {
  [key: string]: {
    data: any;
    timestamp: number;
  };
} = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWithTimeout(url: string, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'LegionRoiTracker/1.0'
      },
      signal: controller.signal,
      cache: 'no-cache'
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function fetchTokenPrice(): Promise<TokenPrice> {
  const cacheKey = 'token-price';
  const now = Date.now();
  const cached = cache[cacheKey];

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetchWithTimeout(`${BYBIT_API}/tickers?category=spot&symbol=FUELUSDT`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data?.result?.list?.[0]?.lastPrice) {
      const price = parseFloat(data.result.list[0].lastPrice);
      if (isNaN(price) || price <= 0) {
        throw new Error('Invalid price value received');
      }
      lastValidPrice = price;
      const result = { 'fuel-network': { usd: price } };
      
      cache[cacheKey] = {
        data: result,
        timestamp: now
      };
      
      return result;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching price data:', error);
    return {
      'fuel-network': { usd: lastValidPrice ?? FALLBACK_PRICE }
    };
  }
}

export async function fetchCandlestickData(
  interval: string = '240',
  limit: number = 200 // Reduced limit for better performance
): Promise<CandlestickData[]> {
  const cacheKey = `candlestick-${interval}`;
  const now = Date.now();
  const cached = cache[cacheKey];

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const url = `${BYBIT_API}/kline?category=spot&symbol=FUELUSDT&interval=${interval}&limit=${limit}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.result?.list) {
      throw new Error('Invalid response format from ByBit');
    }

    const result = data.result.list.map((item: string[]) => ({
      time: new Date(parseInt(item[0]) > 9999999999 ? parseInt(item[0]) : parseInt(item[0]) * 1000).toISOString(),
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5])
    })).reverse();

    cache[cacheKey] = {
      data: result,
      timestamp: now
    };

    return result;
  } catch (error) {
    console.error('Error fetching candlestick data:', error);
    throw error;
  }
}