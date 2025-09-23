'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });

interface OceanDataPoint {
  id: string;
  lat: number;
  lng: number;
  concentration: number;
  risk: 'low' | 'medium' | 'high';
  label: string;
  description: string;
}

const RealOceanMap: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const oceanData: OceanDataPoint[] = [
    {
      id: '1',
      lat: 28.0,
      lng: -155.0,
      concentration: 2.3,
      risk: 'high',
      label: 'Great Pacific Garbage Patch',
      description: 'Largest accumulation of ocean plastic in the world'
    },
    {
      id: '2',
      lat: 35.0,
      lng: -40.0,
      concentration: 1.8,
      risk: 'medium',
      label: 'North Atlantic Gyre',
      description: 'Significant microplastic accumulation zone'
    },
    {
      id: '3',
      lat: 35.0,
      lng: 18.0,
      concentration: 3.1,
      risk: 'high',
      label: 'Mediterranean Sea',
      description: 'One of the most polluted seas globally'
    },
    {
      id: '4',
      lat: -25.0,
      lng: -120.0,
      concentration: 0.9,
      risk: 'low',
      label: 'South Pacific',
      description: 'Relatively clean ocean region'
    },
    {
      id: '5',
      lat: -10.0,
      lng: 80.0,
      concentration: 2.7,
      risk: 'high',
      label: 'Indian Ocean',
      description: 'High microplastic concentration due to river inputs'
    },
    {
      id: '6',
      lat: -30.0,
      lng: -20.0,
      concentration: 1.2,
      risk: 'low',
      label: 'South Atlantic',
      description: 'Moderate microplastic levels'
    },
    {
      id: '7',
      lat: 20.0,
      lng: -80.0,
      concentration: 1.5,
      risk: 'medium',
      label: 'Caribbean Sea',
      description: 'Tourism and coastal development impact'
    },
    {
      id: '8',
      lat: 25.0,
      lng: 35.0,
      concentration: 2.1,
      risk: 'high',
      label: 'Red Sea',
      description: 'High pollution due to shipping and coastal cities'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#f97316'; // coral
      case 'medium': return '#0891b2'; // ocean-secondary
      case 'low': return '#14b8a6'; // seafoam
      default: return '#6b7280';
    }
  };

  const getMarkerSize = (concentration: number) => {
    if (concentration > 2.5) return 12;
    if (concentration > 1.5) return 10;
    return 8;
  };

  if (!mounted) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-ocean-surface via-ocean-light to-ocean-secondary rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-primary mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading Ocean Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        minZoom={1}
        maxZoom={6}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        dragging={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        zoomControl={true}
      >
        {/* Ocean-themed tile layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Ocean data points */}
        {oceanData.map((point) => (
          <CircleMarker
            key={point.id}
            center={[point.lat, point.lng]}
            radius={getMarkerSize(point.concentration)}
            pathOptions={{
              fillColor: getRiskColor(point.risk),
              color: '#ffffff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            }}
            eventHandlers={{
              mouseover: (e) => {
                e.target.setStyle({
                  weight: 3,
                  fillOpacity: 1
                });
              },
              mouseout: (e) => {
                e.target.setStyle({
                  weight: 2,
                  fillOpacity: 0.8
                });
              }
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{point.label}</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Concentration:</span> {point.concentration} mg/L
                  </div>
                  <div>
                    <span className="font-medium">Risk Level:</span> 
                    <span className={cn(
                      "ml-1 font-semibold capitalize",
                      point.risk === 'high' ? 'text-red-600' : 
                      point.risk === 'medium' ? 'text-blue-600' : 'text-green-600'
                    )}>
                      {point.risk}
                    </span>
                  </div>
                  <div className="text-gray-600 mt-2">
                    {point.description}
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
        <div className="text-xs font-semibold text-gray-800 mb-2">Microplastic Risk Levels</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f97316' }}></div>
            <span className="text-xs text-gray-600">High Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0891b2' }}></div>
            <span className="text-xs text-gray-600">Medium Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#14b8a6' }}></div>
            <span className="text-xs text-gray-600">Low Risk</span>
          </div>
        </div>
      </div>

       {/* Map Title */}
       <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg z-10">
         <div className="text-sm font-bold text-gray-800">Global Microplastic Prediction Map</div>
       </div>
    </div>
  );
};

export default RealOceanMap;