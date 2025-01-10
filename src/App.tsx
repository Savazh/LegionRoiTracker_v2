import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TokenTable } from './components/TokenTable';
import { TokenDetails } from './components/TokenDetails';
import { CornAnimation } from './components/CornAnimation';
import { LegionLogo } from './components/LegionLogo';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-blue-900 text-cyan-300">
        <CornAnimation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <div className="flex flex-col items-center justify-center gap-4 mb-6">
              <LegionLogo />
            </div>
            <p className="text-cyan-200 max-w-2xl mx-auto border-b border-cyan-500/20 pb-4">
              Track your ICO investments and monitor their performance in real-time. Stay updated with the latest prices and ROI calculations.
            </p>
          </header>

          <main>
            <Routes>
              <Route path="/" element={
                <div className="bg-black/40 rounded-xl p-6 backdrop-blur-sm shadow-xl border border-cyan-500/20">
                  <TokenTable />
                </div>
              } />
              <Route path="/token/:id" element={<TokenDetails />} />
              <Route path="*" element={<TokenDetails />} />
            </Routes>
          </main>

          <footer className="mt-12 text-center text-cyan-300/60 text-sm">
            <p>&copy; {new Date().getFullYear()} Legion Sales Tracker. All rights reserved. Not affiliated with Legion, not official tracker.</p>
          </footer>
        </div>
      </div>
    </Router>
  );
}