# BlueShield Backend

A FastAPI-based backend service for marine microplastic concentration prediction and analysis.

## Overview

BlueShield is a marine environmental monitoring system that uses machine learning to predict microplastic concentrations in ocean waters. The system provides real-time predictions based on oceanographic data and helps researchers and environmental agencies monitor marine pollution.

## Features

- **Microplastic Prediction**: Predict microplastic concentrations in marine environments
- **User Management**: Secure user authentication and authorization
- **RESTful API**: Clean and well-documented API endpoints
- **MongoDB Integration**: Scalable NoSQL database for data storage
- **Machine Learning**: LSTM-based prediction models for accurate forecasting

## Tech Stack

- **Framework**: FastAPI
- **Database**: MongoDB with Beanie ODM
- **Authentication**: JWT-based authentication
- **Machine Learning**: TensorFlow/Keras for LSTM models
- **Data Processing**: Pandas, NumPy for data manipulation
- **API Documentation**: Automatic OpenAPI/Swagger documentation

## Project Structure

```
BlueShield-backend/
├── app/
│   ├── api/                    # API endpoints and routing
│   │   └── v1/
│   │       └── endpoints/      # Individual endpoint modules
│   ├── config/                 # Configuration settings
│   ├── core/                   # Core functionality (auth, middleware)
│   ├── models/                 # Database models
│   │   ├── prediction.py       # Prediction model
│   │   └── user.py            # User model
│   ├── schemas/                # Pydantic schemas for API
│   ├── services/               # Business logic services
│   │   ├── ml/                # Machine learning services
│   │   ├── chatbot/           # Chatbot functionality
│   │   ├── data/              # Data processing services
│   │   ├── location/          # Geospatial services
│   │   ├── notification/      # Notification services
│   │   └── risk_assessment/   # Risk assessment services
│   └── utils/                 # Utility functions
├── data/                      # Data storage directories
├── scripts/                   # Utility scripts
├── tests/                     # Test files
└── requirements.txt           # Python dependencies
```

## Database Models

### User Model
- `email`: User email address (unique)
- `username`: Username (unique)
- `hashed_password`: Encrypted password
- `is_active`: Account status
- `created_at`: Account creation timestamp

### Prediction Model
- `user_id`: ID of user who requested prediction
- `prediction_type`: Type of prediction (currently only MP_CONCENTRATION)
- `status`: Prediction status (PENDING, COMPLETED, FAILED)
- `latitude`: Geographic latitude
- `longitude`: Geographic longitude
- `input_data`: Oceanographic parameters (temperature, salinity, etc.)
- `prediction_result`: ML model output (concentration, confidence interval, risk level)
- `confidence_score`: Model confidence (0-1)
- `created_at`: Prediction creation timestamp
- `updated_at`: Last update timestamp

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile

### Predictions
- `POST /api/v1/predictions/` - Create new prediction
- `GET /api/v1/predictions/` - Get user's predictions
- `GET /api/v1/predictions/{id}` - Get specific prediction

### Public Dashboard
- `GET /api/v1/public/dashboard` - Public data dashboard

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BlueShield-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv myenv
   source myenv/bin/activate  # On Windows: myenv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```   

5. **Run the application**
   ```bash
   uvicorn app.main:app --reload
   ```

## Configuration

Create a `.env` file with the following variables:

```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=blueshield

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API
API_V1_STR=/api/v1
PROJECT_NAME=BlueShield API
```

## Database Setup

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Seed sample data**
   ```bash
   python scripts/seed_data.py
   ```

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
isort .
```

### API Documentation
Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Machine Learning

The system uses LSTM (Long Short-Term Memory) neural networks for microplastic concentration prediction. The ML pipeline includes:

- Data preprocessing and normalization
- Time series analysis
- Feature engineering from oceanographic data
- Model training and validation
- Prediction inference

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact the development team.
