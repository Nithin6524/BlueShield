# Microplastic Prediction Feature

## Overview
The microplastic prediction feature allows users to click on the Bay of Bengal map to get AI-powered predictions of microplastic concentration at specific locations.

## Features
- **Interactive Map**: Leaflet-based map focused on the Bay of Bengal region
- **Click-to-Predict**: Users can click anywhere on the map to get predictions
- **Real-time Loading**: Loading spinner and UI feedback during prediction
- **Risk Assessment**: Color-coded risk levels (Low, Medium, High)
- **Prediction History**: Track recent predictions
- **Responsive Design**: Works on desktop and mobile devices

## Components

### MicroplasticPredictionMap.tsx
- Main map component with Bay of Bengal bounds
- Handles map clicks and coordinate validation
- Displays prediction results with markers
- Shows loading states and error messages

### PredictionsPage.tsx
- Main page layout with map and sidebar
- Prediction history management
- Instructions and model information
- Responsive grid layout

### predictionService.ts
- API service for backend communication
- Handles authentication tokens
- Type-safe request/response handling

## Backend Integration

### API Endpoint: `/api/v1/predictions/microplastic`
- **Method**: POST
- **Body**: `{ latitude: number, longitude: number, prediction_type: string }`
- **Response**: Prediction result with concentration, confidence, and risk level

### Mock Implementation
Currently uses a simulated prediction model that:
- Validates coordinates are within Bay of Bengal bounds
- Generates realistic concentration values based on location
- Provides confidence scores and risk assessments
- Stores prediction history (when database is connected)

## Usage

1. Navigate to `/predictions` page
2. Click anywhere on the Bay of Bengal map
3. Wait for the AI model to process (loading spinner shown)
4. View the prediction results with:
   - Microplastic concentration (mg/L)
   - Risk level (Low/Medium/High)
   - Confidence percentage
   - Timestamp

## Technical Details

### Map Configuration
- **Bounds**: 5°N to 25°N, 80°E to 100°E
- **Center**: 15°N, 90°E
- **Zoom**: 6 (initial), 5-10 (range)
- **Tile Layer**: OpenStreetMap

### Risk Level Classification
- **High Risk**: ≥ 2.5 mg/L (Red markers)
- **Medium Risk**: 1.0 - 2.5 mg/L (Amber markers)
- **Low Risk**: < 1.0 mg/L (Green markers)

### Error Handling
- Coordinate validation (must be within Bay of Bengal)
- Network error handling
- User-friendly error messages
- Graceful fallbacks

## Future Enhancements
- Integration with real LSTM model
- Historical data visualization
- Export prediction data
- Advanced filtering options
- Real-time data updates
