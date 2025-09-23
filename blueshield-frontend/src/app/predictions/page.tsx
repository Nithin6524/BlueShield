'use client';

import React, { useState } from 'react';
import MicroplasticPredictionMap from '@/components/MicroplasticPredictionMap';
import AuthGuard from '@/components/AuthGuard';
import { cn } from '@/lib/utils';
import { PredictionResponse } from '@/services/predictionService';

type PredictionResult = PredictionResponse;

const PredictionsPage: React.FC = () => {
  const [predictionHistory, setPredictionHistory] = useState<PredictionResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handlePredictionComplete = (result: PredictionResult) => {
    setPredictionHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 predictions
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-16">
          <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Microplastic Prediction
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Click anywhere on the Bay of Bengal map to predict microplastic concentration 
            at that location. Our AI model analyzes oceanographic data to provide accurate predictions.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Bay of Bengal Region
              </h2>
              <MicroplasticPredictionMap onPredictionComplete={handlePredictionComplete} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">How to Use</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>Click anywhere on the Bay of Bengal map</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>Wait for the AI model to analyze the location</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>View the predicted microplastic concentration and risk level</div>
                </div>
              </div>
            </div>

            {/* Prediction History */}
            {predictionHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Recent Predictions</h3>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showHistory ? 'Hide' : 'Show'} History
                  </button>
                </div>
                
                {showHistory && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {predictionHistory.map((prediction, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-gray-800">
                            {prediction.location.lat.toFixed(3)}, {prediction.location.lng.toFixed(3)}
                          </div>
                          <div className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border",
                            getRiskColor(prediction.risk_level)
                          )}>
                            {getRiskLabel(prediction.risk_level)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Concentration: <span className="font-medium">{prediction.concentration.toFixed(2)} mg/L</span></div>
                          <div>Confidence: <span className="font-medium">{(prediction.confidence * 100).toFixed(1)}%</span></div>
                          {prediction.region_factor && (
                            <div className="text-xs text-gray-500">
                              Region: <span className="font-medium capitalize">{prediction.region_factor.replace('_', ' ')}</span>
                            </div>
                          )}
                          {prediction.distance_from_major_rivers_km && (
                            <div className="text-xs text-gray-500">
                              Distance from rivers: <span className="font-medium">{prediction.distance_from_major_rivers_km} km</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(prediction.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Model Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">About the Model</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <div className="font-medium text-gray-800 mb-1">Data Sources</div>
                  <div>Oceanographic data, satellite imagery, and historical microplastic measurements</div>
                </div>
                <div>
                  <div className="font-medium text-gray-800 mb-1">Model Type</div>
                  <div>LSTM neural network trained on Bay of Bengal region data</div>
                </div>
                <div>
                  <div className="font-medium text-gray-800 mb-1">Accuracy</div>
                  <div>~85% accuracy in concentration prediction</div>
                </div>
              </div>
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
