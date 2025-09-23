'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { predictionService, PredictionResponse } from '@/services/predictionService';
import { useAuth } from '@/contexts/AuthContext';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-800 font-medium">Loading Map...</p>
      </div>
    </div>
  )
});
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

// Use the imported type from predictionService
type PredictionResult = PredictionResponse;

interface MicroplasticPredictionMapProps {
  onPredictionComplete?: (result: PredictionResult) => void;
}

// Error boundary component for map
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[600px] bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-red-800 font-bold text-lg mb-2">Map Loading Error</h3>
            <p className="text-red-600 text-sm mb-4">
              Unable to load the map. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Component to handle map click events
const MapClickHandler: React.FC<{
  onMapClick: (e: any) => void;
}> = ({ onMapClick }) => {
  // Import useMapEvents dynamically to avoid SSR issues
  const { useMapEvents } = require('react-leaflet');
  useMapEvents({
    click: onMapClick,
  });
  return null;
};

// Custom marker component to avoid icon issues
const CustomMarker: React.FC<{
  position: [number, number];
  children: React.ReactNode;
  riskLevel?: string;
  autoOpen?: boolean;
  onRef?: (ref: any) => void;
}> = ({ position, children, riskLevel = 'medium', autoOpen = false, onRef }) => {
  const { Marker } = require('react-leaflet');
  const markerRef = React.useRef<any>(null);
  
  // Dynamically import Leaflet only when needed
  const L = require('leaflet');
  
  // Get risk color based on risk level
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#ef4444'; // red
      case 'medium': return '#f59e0b'; // amber
      case 'low': return '#10b981'; // emerald
      default: return '#6b7280';
    }
  };
  
  // Create a custom icon using a simple div with risk-based color
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${getRiskColor(riskLevel)}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  // Auto-open popup when marker is ready and autoOpen is true
  React.useEffect(() => {
    if (autoOpen && markerRef.current) {
      setTimeout(() => {
        try {
          markerRef.current.openPopup();
          console.log('Auto-opening prediction popup');
        } catch (error) {
          console.log('Error opening popup:', error);
        }
      }, 100);
    }
  }, [autoOpen]);

  // Pass ref to parent component
  React.useEffect(() => {
    if (onRef && markerRef.current) {
      onRef(markerRef.current);
    }
  }, [onRef]);

  return (
    <Marker 
      ref={markerRef}
      position={position} 
      icon={customIcon}
    >
      {children}
    </Marker>
  );
};

const MicroplasticPredictionMap: React.FC<MicroplasticPredictionMapProps> = ({ 
  onPredictionComplete 
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [markerReady, setMarkerReady] = useState(false);
  const mapRef = React.useRef<HTMLDivElement>(null);
  const predictionMarkerRef = React.useRef<any>(null);

  // Bay of Bengal bounds
  const bayOfBengalBounds = {
    north: 25.0,
    south: 5.0,
    east: 100.0,
    west: 80.0
  };

  const center = [15.0, 90.0]; // Center of Bay of Bengal

  useEffect(() => {
    // Ensure we're in the browser environment
    if (typeof window === 'undefined') return;
    
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setMounted(true);
      
      // Fix Leaflet default marker icons
      try {
        // Dynamically import Leaflet only when needed
        const L = require('leaflet');
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      } catch (error) {
        console.warn('Failed to configure Leaflet icons:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Auto-open popup when prediction result is available and marker is ready
  useEffect(() => {
    if (predictionResult && markerReady && predictionMarkerRef.current) {
      setTimeout(() => {
        try {
          predictionMarkerRef.current.openPopup();
          console.log('Auto-opening prediction popup');
        } catch (error) {
          console.log('Error opening popup:', error);
        }
      }, 100);
    }
  }, [predictionResult, markerReady]);

  const handleMapClick = useCallback(async (e: any) => {
    const { lat, lng } = e.latlng;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('Please sign in to make predictions');
      openAuthModal('/predictions');
      return;
    }
    
    // Check if click is within Bay of Bengal bounds
    if (lat < bayOfBengalBounds.south || lat > bayOfBengalBounds.north || 
        lng < bayOfBengalBounds.west || lng > bayOfBengalBounds.east) {
      setError('Please click within the Bay of Bengal region');
      return;
    }

    setSelectedLocation({ lat, lng });
    setError(null);
    setIsLoading(true);
    setPredictionResult(null);
    setMarkerReady(false);

    try {
      console.log('Making prediction request for:', { lat, lng });
      const result = await predictionService.predictMicroplasticConcentration(lat, lng);
      console.log('Prediction result:', result);
      setPredictionResult(result);
      onPredictionComplete?.(result);
    } catch (err) {
      console.error('Prediction error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      // If it's an auth error, open the auth modal
      if (errorMessage.includes('Authentication required') || errorMessage.includes('Session expired')) {
        openAuthModal('/predictions');
      }
    } finally {
      setIsLoading(false);
    }
  }, [onPredictionComplete, isAuthenticated, openAuthModal]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#ef4444'; // red
      case 'medium': return '#f59e0b'; // amber
      case 'low': return '#10b981'; // emerald
      default: return '#6b7280';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'high': return 'High Risk';
      case 'medium': return 'Medium Risk';
      case 'low': return 'Low Risk';
      default: return 'Unknown';
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800 font-medium">Loading Bay of Bengal Map...</p>
        </div>
      </div>
    );
  }

  // Add error boundary for map rendering
  if (typeof window === 'undefined') {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-blue-800 font-medium">Map loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MapErrorBoundary>
      <div ref={mapRef} className="w-full h-[600px] rounded-2xl overflow-hidden shadow-xl border-2 border-blue-200 relative">
        <style jsx global>{`
          .custom-marker {
            background: transparent !important;
            border: none !important;
          }
          .leaflet-marker-icon {
            background: transparent !important;
          }
          .leaflet-container {
            height: 100% !important;
            width: 100% !important;
          }
        `}</style>
        <MapContainer
        center={center as [number, number]}
        zoom={6}
        minZoom={5}
        maxZoom={10}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        maxBounds={[
          [bayOfBengalBounds.south, bayOfBengalBounds.west], 
          [bayOfBengalBounds.north, bayOfBengalBounds.east]
        ]}
        maxBoundsViscosity={1.0}
        key="map-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Selected location marker */}
        {selectedLocation && (
          <CustomMarker 
            position={[selectedLocation.lat, selectedLocation.lng]}
            riskLevel={predictionResult?.risk_level || 'medium'}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg text-gray-800 mb-2">Selected Location</h3>
                <div className="text-sm text-gray-600">
                  <div>Lat: {selectedLocation.lat.toFixed(4)}</div>
                  <div>Lng: {selectedLocation.lng.toFixed(4)}</div>
                </div>
              </div>
            </Popup>
          </CustomMarker>
        )}

        {/* Prediction result marker */}
        {predictionResult && (
          <CustomMarker 
            position={[predictionResult.location.lat, predictionResult.location.lng]}
            riskLevel={predictionResult.risk_level}
            autoOpen={true}
            onRef={(ref) => {
              predictionMarkerRef.current = ref;
              console.log('Marker ref set:', ref);
              if (ref) {
                setMarkerReady(true);
              }
            }}
          >
            <Popup>
              <div className="p-4 min-w-[320px] max-w-[400px]">
                <h3 className="font-bold text-lg text-gray-800 mb-3">Microplastic Prediction</h3>
                
                {/* Main prediction data */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Concentration:</span>
                    <span className="font-bold text-blue-600">
                      {predictionResult.concentration.toFixed(2)} mg/L
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Risk Level:</span>
                    <span className={cn(
                      "font-bold",
                      predictionResult.risk_level === 'high' ? 'text-red-600' : 
                      predictionResult.risk_level === 'medium' ? 'text-amber-600' : 'text-green-600'
                    )}>
                      {getRiskLabel(predictionResult.risk_level)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Confidence:</span>
                    <span className="font-bold text-gray-600">
                      {(predictionResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Risk description */}
                {predictionResult.risk_description && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-700">{predictionResult.risk_description}</p>
                  </div>
                )}

                {/* Additional details */}
                <div className="space-y-1 text-xs text-gray-600 mb-3">
                  {predictionResult.region_factor && (
                    <div className="flex justify-between">
                      <span>Region:</span>
                      <span className="font-medium capitalize">{predictionResult.region_factor.replace('_', ' ')}</span>
                    </div>
                  )}
                  {predictionResult.distance_from_major_rivers_km && (
                    <div className="flex justify-between">
                      <span>Distance from rivers:</span>
                      <span className="font-medium">{predictionResult.distance_from_major_rivers_km} km</span>
                    </div>
                  )}
                  {predictionResult.seasonal_factor && (
                    <div className="flex justify-between">
                      <span>Seasonal factor:</span>
                      <span className="font-medium">{predictionResult.seasonal_factor}x</span>
                    </div>
                  )}
                  {predictionResult.prediction_uncertainty && (
                    <div className="flex justify-between">
                      <span>Uncertainty:</span>
                      <span className="font-medium">±{(predictionResult.prediction_uncertainty * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>

                {/* Data sources */}
                {predictionResult.data_sources && predictionResult.data_sources.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-gray-700 mb-1">Data Sources:</div>
                    <div className="flex flex-wrap gap-1">
                      {predictionResult.data_sources.map((source, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {source.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Model info */}
                {predictionResult.model_version && (
                  <div className="text-xs text-gray-500 mb-2">
                    Model: {predictionResult.model_version}
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-xs text-gray-500 border-t pt-2">
                  Predicted at: {new Date(predictionResult.timestamp).toLocaleString()}
                </div>
              </div>
            </Popup>
          </CustomMarker>
        )}
      </MapContainer>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <div className="font-medium text-gray-800">Analyzing Location...</div>
                <div className="text-sm text-gray-600">Running microplastic prediction model</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-lg z-10">
          <div className="flex items-center">
            <div className="text-red-500 mr-2">⚠️</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg z-10">
        <div className="text-sm font-bold text-gray-800 mb-1">Bay of Bengal Microplastic Prediction</div>
        <div className="text-xs text-gray-600">Click anywhere on the map to predict microplastic concentration</div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
        <div className="text-xs font-semibold text-gray-800 mb-2">Risk Levels</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">High Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs text-gray-600">Medium Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Low Risk</span>
          </div>
        </div>
      </div>
      </div>
    </MapErrorBoundary>
  );
};

export default MicroplasticPredictionMap;
