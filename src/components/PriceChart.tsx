import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';
import { CandlestickData } from '../types';
import { fetchCandlestickData } from '../utils/api';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

interface PriceChartProps {
  tokenId: string;
  currentPrice: number | null;
}

export function PriceChart({ tokenId, currentPrice }: PriceChartProps) {
  const [data, setData] = useState<CandlestickData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ChartJS | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newData = await fetchCandlestickData('240');
      setData(newData);
    } catch (err) {
      setError('Failed to fetch chart data');
      console.error('Chart data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Reduced polling frequency
    const timer = setInterval(fetchData, 300000); // 5 minutes
    return () => clearInterval(timer);
  }, [fetchData]);

  const handleZoomIn = () => {
    if (chartRef.current) {
      chartRef.current.zoom(1.1);
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      chartRef.current.zoom(0.9);
    }
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Disabled animations for better performance
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        radius: 0, // Hide points for better performance
        hitRadius: 10,
        hoverRadius: 4
      },
      line: {
        tension: 0 // Disable line tension for better performance
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day'
        },
        grid: {
          display: false // Hide grid for better performance
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        }
      },
      y: {
        position: 'right',
        grid: {
          display: false
        },
        ticks: {
          callback: (value) => `$${Number(value).toFixed(6)}`
        }
      },
      y1: {
        position: 'left',
        grid: {
          display: false
        },
        ticks: {
          callback: (value) => `${Number(value).toLocaleString()}`
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        animation: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (context.dataset.yAxisID === 'y1') {
              return `Volume: ${value.toLocaleString()}`;
            }
            return `Price: $${value.toFixed(6)}`;
          }
        }
      },
      zoom: {
        limits: {
          x: {min: 'original', max: 'original'},
        },
        pan: {
          enabled: true,
          mode: 'x',
          threshold: 10
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1
          },
          pinch: {
            enabled: true
          },
          mode: 'x'
        }
      }
    }
  };

  const chartData = {
    labels: data.map(d => new Date(d.time)),
    datasets: [
      {
        data: data.map(d => d.close),
        borderColor: '#ff00ff',
        backgroundColor: 'transparent',
        borderWidth: 1,
        fill: false,
        yAxisID: 'y'
      },
      {
        type: 'bar' as const,
        data: data.map(d => d.volume),
        yAxisID: 'y1',
        backgroundColor: 'rgba(0, 255, 255, 0.2)',
        borderColor: 'transparent',
        maxBarThickness: 2
      }
    ]
  };

  return (
    <div className="bg-black/20 p-6 rounded-lg border border-cyan-500/10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-pink-500">Price Chart (ByBit)</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-md bg-black/40 text-cyan-300 hover:bg-pink-500/20 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-md bg-black/40 text-cyan-300 hover:bg-pink-500/20 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 rounded-md bg-black/40 text-cyan-300 hover:bg-pink-500/20 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw size={20} />
          </button>
          {currentPrice && (
            <span className="text-cyan-300 font-mono ml-4">
              ${currentPrice.toFixed(6)}
            </span>
          )}
        </div>
      </div>

      <div className="h-[600px] relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500" />
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <p className="text-pink-500">{error}</p>
          </div>
        ) : (
          <Line 
            data={chartData} 
            options={options} 
            ref={chartRef}
          />
        )}
      </div>
    </div>
  );
}