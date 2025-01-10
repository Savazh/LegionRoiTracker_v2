import { useState, useEffect } from 'react';
import { NewsItem } from '../types';

interface NewsSectionProps {
  tokenId: string;
}

export function NewsSection({ tokenId }: NewsSectionProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        // Note: Twitter API requires authentication and is not free
        // For now, we'll use mock data
        const mockNews: NewsItem[] = [
          {
            id: '1',
            title: 'Fuel Network Mainnet Launch Update',
            content: 'Exciting progress on our path to mainnet. Stay tuned for more updates!',
            source: '@fuel_network',
            url: 'https://twitter.com/fuel_network',
            timestamp: new Date().toISOString()
          },
          {
            id: '2',
            title: 'New Partnership Announcement',
            content: 'We are thrilled to announce our latest partnership to expand the Fuel ecosystem.',
            source: '@fuel_network',
            url: 'https://twitter.com/fuel_network',
            timestamp: new Date(Date.now() - 86400000).toISOString()
          }
        ];

        setNews(mockNews);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [tokenId]);

  if (loading) {
    return (
      <div className="bg-black/20 p-6 rounded-lg border border-cyan-500/10">
        <h2 className="text-xl font-semibold text-pink-500 mb-4">Latest News</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-black/40 rounded-lg"></div>
          <div className="h-20 bg-black/40 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 p-6 rounded-lg border border-cyan-500/10">
      <h2 className="text-xl font-semibold text-pink-500 mb-4">Latest News</h2>
      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="p-4 bg-black/40 rounded-lg border border-cyan-500/20">
            <div className="flex justify-between items-start">
              <h3 className="text-cyan-300 font-semibold">{item.title}</h3>
              <span className="text-cyan-500/60 text-sm">
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-2 text-cyan-100">{item.content}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-cyan-500/60 text-sm">{item.source}</span>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 text-sm"
              >
                View on Twitter →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}