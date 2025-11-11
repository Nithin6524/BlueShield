'use client';

import React, { useState } from 'react';
import MicroplasticPredictionMap from '@/components/MicroplasticPredictionMap';
import AuthGuard from '@/components/AuthGuard';
import { cn } from '@/lib/utils';
import { PredictionResponse } from '@/services/predictionService';

type PredictionResult = PredictionResponse;

const PredictionsPage: React.FC = () => {
  const [predictionHistory, setPredictionHistory] = useState<PredictionResult[]>([]);
  

  const handlePredictionComplete = (result: PredictionResult) => {
    setPredictionHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 predictions
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-300 bg-red-500/10 border-red-400/40';
      case 'medium': return 'text-amber-300 bg-amber-500/10 border-amber-400/40';
      case 'low': return 'text-green-300 bg-green-500/10 border-green-400/40';
      default: return 'text-gray-300 bg-white/10 border-white/20';
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

  return (
    <AuthGuard>
      <main className="min-h-screen">
        <div className="min-h-screen bg-ocean-deep pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Microplastic Prediction
          </h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Click anywhere on the Bay of Bengal map to predict microplastic concentration 
            at that location.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4">
                Bay of Bengal Region
              </h2>
              <MicroplasticPredictionMap onPredictionComplete={handlePredictionComplete} />
          </div>

         
         
         
              <div >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Recent Predictions</h3>
                </div>
                
                
                  <div className="space-y-3 max-h-[580px]  overflow-y-scroll scrollbar-hide">
                    {predictionHistory.map((prediction, index) => (
                      <div
                        key={index}
                        className="border border-white/20 rounded-lg p-3 hover:bg-white/5 w-[90%] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-white">
                            {prediction.location.lat.toFixed(3)}, {prediction.location.lng.toFixed(3)}
                          </div>
                          <div className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border",
                            getRiskColor(prediction.risk_level)
                          )}>
                            {getRiskLabel(prediction.risk_level)}
                          </div>
                        </div>
                        <div className="text-sm text-white/80">
                          <div>Concentration: <span className="font-medium text-white">{prediction.concentration.toFixed(2)} mg/L</span></div>
                          {/* <div>Confidence: <span className="font-medium text-white">{(prediction.confidence * 100).toFixed(1)}%</span></div> */}
                          {prediction.region_factor && (
                            <div className="text-xs text-white/60">
                              Region: <span className="font-medium capitalize">{prediction.region_factor.replace('_', ' ')}</span>
                            </div>
                          )}
                          {prediction.distance_from_major_rivers_km && (
                            <div className="text-xs text-white/60">
                              Distance from rivers: <span className="font-medium">{prediction.distance_from_major_rivers_km} km</span>
                            </div>
                          )}
                          <div className="text-xs text-white/60 mt-1">
                            {new Date(prediction.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                
              </div>
            

          
        </div>
          </div>


        </div>
      </main>
    </AuthGuard>
  
  );
};

export default PredictionsPage;
