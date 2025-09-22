'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MapPoint {
  id: string;
  x: number;
  y: number;
  concentration: number;
  risk: 'low' | 'medium' | 'high';
  label: string;
}

const OceanMapPreview: React.FC = () => {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

  const mapPoints: MapPoint[] = [
    { id: '1', x: 20, y: 30, concentration: 2.3, risk: 'high', label: 'Great Pacific Garbage Patch' },
    { id: '2', x: 60, y: 25, concentration: 1.8, risk: 'medium', label: 'North Atlantic' },
    { id: '3', x: 75, y: 60, concentration: 3.1, risk: 'high', label: 'Mediterranean Sea' },
    { id: '4', x: 15, y: 70, concentration: 0.9, risk: 'low', label: 'South Pacific' },
    { id: '5', x: 85, y: 40, concentration: 2.7, risk: 'high', label: 'Indian Ocean' },
    { id: '6', x: 45, y: 80, concentration: 1.2, risk: 'low', label: 'South Atlantic' },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-coral';
      case 'medium': return 'bg-ocean-secondary';
      case 'low': return 'bg-seafoam';
      default: return 'bg-gray-400';
    }
  };

  const getRiskSize = (concentration: number) => {
    if (concentration > 2.5) return 'w-6 h-6';
    if (concentration > 1.5) return 'w-5 h-5';
    return 'w-4 h-4';
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-ocean-surface via-ocean-light to-ocean-secondary rounded-2xl overflow-hidden">
      {/* Ocean Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-16 w-24 h-24 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 right-1/4 w-28 h-28 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Wave Animation */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-ocean-primary/30 to-transparent animate-pulse"></div>
        <div className="absolute bottom-2 left-0 w-full h-6 bg-gradient-to-t from-ocean-secondary/20 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Map Points */}
      {mapPoints.map((point) => (
        <div
          key={point.id}
          className={cn(
            "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-125",
            getRiskColor(point.risk),
            getRiskSize(point.concentration),
            "rounded-full border-2 border-white shadow-lg"
          )}
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
          onMouseEnter={() => setHoveredPoint(point.id)}
          onMouseLeave={() => setHoveredPoint(null)}
          onClick={() => setSelectedPoint(selectedPoint === point.id ? null : point.id)}
        >
          {/* Pulse animation for high risk points */}
          {point.risk === 'high' && (
            <div className="absolute inset-0 rounded-full bg-coral animate-ping opacity-30"></div>
          )}
        </div>
      ))}

      {/* Hover Tooltip */}
      {hoveredPoint && (
        <div className="absolute z-10 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-white/20 pointer-events-none">
          {(() => {
            const point = mapPoints.find(p => p.id === hoveredPoint);
            return point ? (
              <div>
                <div className="font-semibold text-text-primary text-sm">{point.label}</div>
                <div className="text-xs text-text-secondary">
                  Concentration: {point.concentration} mg/L
                </div>
                <div className={cn(
                  "text-xs font-medium capitalize",
                  point.risk === 'high' ? 'text-coral' : 
                  point.risk === 'medium' ? 'text-ocean-secondary' : 'text-seafoam'
                )}>
                  Risk: {point.risk}
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Selected Point Details */}
      {selectedPoint && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/20">
          {(() => {
            const point = mapPoints.find(p => p.id === selectedPoint);
            return point ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-text-primary">{point.label}</h3>
                  <button
                    onClick={() => setSelectedPoint(null)}
                    className="text-text-light hover:text-text-primary transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Concentration:</span>
                    <span className="ml-2 font-semibold text-text-primary">{point.concentration} mg/L</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Risk Level:</span>
                    <span className={cn(
                      "ml-2 font-semibold capitalize",
                      point.risk === 'high' ? 'text-coral' : 
                      point.risk === 'medium' ? 'text-ocean-secondary' : 'text-seafoam'
                    )}>
                      {point.risk}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-text-light">
                  Click "Explore Full Map" to see detailed predictions for this region
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-xs font-semibold text-text-primary mb-2">Risk Levels</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-coral rounded-full"></div>
            <span className="text-xs text-text-secondary">High Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-ocean-secondary rounded-full"></div>
            <span className="text-xs text-text-secondary">Medium Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-seafoam rounded-full"></div>
            <span className="text-xs text-text-secondary">Low Risk</span>
          </div>
        </div>
      </div>

      {/* Call to Action Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 pointer-events-auto">
          <span className="text-white font-medium text-sm">Interactive Ocean Map</span>
        </div>
      </div>
    </div>
  );
};

export default OceanMapPreview;
