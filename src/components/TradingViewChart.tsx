import { useEffect, useRef, useState } from 'react';

type TimeInterval = '240' | '180' | '1D' | '1W';

interface ChartConfig {
  interval: TimeInterval;
  chartType: '1' | '2'; // 1 for bars, 2 for candles
}

export function TradingViewChart() {
  const container = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [config, setConfig] = useState<ChartConfig>({
    interval: '240',
    chartType: '2'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      // Safely remove script element
      if (scriptRef.current && scriptRef.current.parentNode) {
        try {
          scriptRef.current.parentNode.removeChild(scriptRef.current);
        } catch (e) {
          console.warn('Script cleanup error:', e);
        }
        scriptRef.current = null;
      }

      // Safely remove widget container
      if (widgetRef.current && widgetRef.current.parentNode) {
        try {
          widgetRef.current.parentNode.removeChild(widgetRef.current);
        } catch (e) {
          console.warn('Widget cleanup error:', e);
        }
        widgetRef.current = null;
      }
    };

    const initChart = () => {
      if (!container.current || !mounted) return;

      try {
        // Clean up previous elements
        cleanup();

        // Create new widget container
        const newWidgetContainer = document.createElement('div');
        newWidgetContainer.className = 'tradingview-widget-container__widget';
        container.current.appendChild(newWidgetContainer);
        widgetRef.current = newWidgetContainer;

        // Create new script element
        const newScript = document.createElement('script');
        newScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        newScript.type = 'text/javascript';
        newScript.async = true;

        // Widget configuration
        const widgetConfig = {
          width: "100%",
          height: 600,
          symbol: "BYBIT:FUELUSDT",
          interval: config.interval,
          timezone: "Etc/UTC",
          theme: "dark",
          style: config.chartType,
          locale: "en",
          enable_publishing: false,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          gridColor: "rgba(0, 255, 255, 0.1)",
          allow_symbol_change: false,
          calendar: false,
          hide_volume: false,
          support_host: "https://www.tradingview.com",
          container_id: "tradingview_chart",
          hide_side_toolbar: false,
          withdateranges: true,
          save_image: true,
          studies: [
            "Volume@tv-basicstudies",
            "VWAP@tv-basicstudies"
          ],
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
          studies_overrides: {
            "volume.volume.color.0": "rgba(255, 0, 255, 0.5)",
            "volume.volume.color.1": "rgba(0, 255, 255, 0.5)"
          },
          overrides: {
            "mainSeriesProperties.candleStyle.upColor": "#00ffff",
            "mainSeriesProperties.candleStyle.downColor": "#ff00ff",
            "mainSeriesProperties.candleStyle.borderUpColor": "#00ffff",
            "mainSeriesProperties.candleStyle.borderDownColor": "#ff00ff",
            "mainSeriesProperties.candleStyle.wickUpColor": "#00ffff",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ff00ff"
          }
        };

        newScript.textContent = JSON.stringify(widgetConfig);

        // Error handling
        newScript.onerror = () => {
          if (mounted) {
            setError('Chart temporarily unavailable. Please refresh the page.');
            setIsLoading(false);
          }
        };

        // Loading state handling
        timeoutId = setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
          }
        }, 2000);

        // Store script reference and append
        scriptRef.current = newScript;
        container.current.appendChild(newScript);
      } catch (err) {
        console.error('Error initializing chart:', err);
        if (mounted) {
          setError('Failed to initialize chart. Please refresh the page.');
          setIsLoading(false);
        }
      }
    };

    // Initialize chart
    initChart();

    // Cleanup function
    return () => {
      mounted = false;
      cleanup();
    };
  }, [config]);

  const intervals: { label: string; value: TimeInterval }[] = [
    { label: '4H', value: '240' },
    { label: '3H', value: '180' },
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' }
  ];

  return (
    <div className="bg-black/20 p-6 rounded-lg border border-cyan-500/10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-pink-500">Price Chart (ByBit)</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            {intervals.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setConfig(prev => ({ ...prev, interval: value }))}
                className={`px-3 py-1 rounded-md transition-colors ${
                  config.interval === value
                    ? 'bg-pink-500 text-white'
                    : 'bg-black/40 text-cyan-300 hover:bg-pink-500/20'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => setConfig(prev => ({
                ...prev,
                chartType: prev.chartType === '1' ? '2' : '1'
              }))}
              className="px-3 py-1 rounded-md bg-black/40 text-cyan-300 hover:bg-pink-500/20"
            >
              {config.chartType === '1' ? 'Bars' : 'Candles'}
            </button>
          </div>
        </div>
      </div>

      <div 
        ref={container}
        className="tradingview-widget-container relative overflow-hidden rounded-lg min-h-[600px]"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <p className="text-pink-500">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}