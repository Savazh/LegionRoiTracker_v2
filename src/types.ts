export interface Token {
  id: string;
  name: string;
  logo: string;
  date: string;
  buyPrice: string;
  currentPrice: string | null;
  roi: string | null;
  status: 'live' | 'pending' | 'upcoming';
  link?: string;
  unlockPrice?: string;
  highestPrice?: string;
  about?: string;
  links?: {
    website: string;
    twitter: string;
  };
}

export interface TokenPrice {
  [key: string]: {
    usd: number;
  };
}

export interface TokenDetails {
  market_data: {
    current_price: {
      usd: number;
    };
  };
}

export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Comment {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
  votes: number;
}

export interface PricePrediction {
  id: string;
  nickname: string;
  predicted_price: number;
  target_date: string;
  created_at: string;
  votes: number;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  timestamp: string;
}