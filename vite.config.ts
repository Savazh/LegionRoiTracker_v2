import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/token/fuel-network', // Remove this line to use root path
  build: {
    chunkSizeWarningLimit: 1000,
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2', 'chartjs-adapter-date-fns', 'chartjs-plugin-zoom'],
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  define: {
    'process.env': {}
  },
  server: {
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.tradingview.com;
        style-src 'self' 'unsafe-inline' https://*.tradingview.com;
        img-src 'self' data: https: http:;
        font-src 'self' data: https://*.tradingview.com;
        connect-src 'self' https://*.tradingview.com wss://*.tradingview.com https://dpvwukegbhgdzamzgelm.supabase.co https://api.kucoin.com https://api.bybit.com https://api.gateio.ws;
        frame-src 'self' https://*.tradingview.com;
        worker-src 'self' blob: https://*.tradingview.com;
      `.replace(/\s+/g, ' ').trim()
    }
  }
});