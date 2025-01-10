import { describe, it, expect, vi } from 'vitest';
import { calculateROI } from '../utils/calculations';
import { tokens } from '../data/tokens';

describe('Token ROI Calculations', () => {
  it('calculates ROI correctly for live tokens', () => {
    const mockToken = tokens.find(t => t.id === 'fuel-network');
    const mockPrices = {
      'fuel-network': { usd: 0.04 }
    };
    
    if (mockToken) {
      const roi = calculateROI(mockToken, mockPrices);
      expect(roi).toBe(200); // 100% increase from 0.02 to 0.04
    }
  });

  it('returns null for non-live tokens', () => {
    const mockToken = tokens.find(t => t.id === 'almanak');
    const mockPrices = {};
    
    if (mockToken) {
      const roi = calculateROI(mockToken, mockPrices);
      expect(roi).toBeNull();
    }
  });

  it('handles missing price data', () => {
    const mockToken = tokens.find(t => t.id === 'fuel-network');
    const mockPrices = {};
    
    if (mockToken) {
      const roi = calculateROI(mockToken, mockPrices);
      expect(roi).toBeNull();
    }
  });
});