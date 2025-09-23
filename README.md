# BlueShield 

**An Integrated Framework for Predicting Microplastic Pollution and Assessing Human Health Risks**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)

##  Project Overview

BlueShield is a comprehensive marine environmental monitoring system that addresses the critical challenge of microplastic pollution in our oceans. The system combines cutting-edge machine learning, geospatial analysis, and risk assessment to provide actionable insights for environmental protection and public health.

### Key Features

- **Interactive Ocean Mapping**: Real-time microplastic concentration predictions using interactive maps
- **AI-Powered Risk Assessment**: Personalized health risk evaluation through intelligent chatbot
- **Advanced Analytics**: LSTM-based time-series forecasting with satellite data integration
- **Secure User Management**: JWT-based authentication with personalized data tracking
- **Geospatial Hotspot Detection**: Identify high-risk pollution zones using clustering algorithms
- **Responsive Design**: Modern, accessible web interface built with Next.js and Tailwind CSS

##  Problem Statement

Microplastics (MPs) have emerged as a pervasive environmental pollutant, raising serious concerns about their ecological impacts and potential risks to human health. The increasing prevalence of microplastics in marine environments poses significant challenges:

1. **Environmental Impact**: Marine life entanglement, ingestion, and ecosystem disruption
2. **Human Health Risks**: Contamination through seafood consumption and potential toxicological effects
3. **Monitoring Challenges**: Difficulty in tracking and predicting microplastic distribution patterns
4. **Policy Gaps**: Lack of comprehensive data for informed environmental management decisions

##  Solution Approach

BlueShield addresses these challenges through an integrated framework that:

### 1. **Predicts MP Concentrations** 
- Utilizes LSTM-based time-series models trained on historical data
- Integrates satellite imagery and oceanographic datasets
- Provides real-time predictions for specific geographic locations

### 2. **Estimates MP Bioaccumulation** 
- Applies mathematical models derived from academic literature
- Accounts for uptake rates, retention times, and elimination rates
- Estimates concentrations in commercially important seafood species

### 3. **Assesses Human Health Risks** 
- Quantifies MP exposure through seafood consumption patterns
- Integrates dietary intake with toxicological assessments
- Provides personalized risk evaluations and mitigation recommendations

##  System Architecture

### Frontend (Next.js + TypeScript)
```
blueshield-frontend/
├── src/
│   ├── app/                    # Next.js 15 app router
│   ├── components/             # React components
│   │   ├── MicroplasticPredictionMap.tsx
│   │   ├── RealOceanMap.tsx
│   │   ├── AboutSection.tsx
│   │   └── ui/                 # Reusable UI components
│   ├── services/               # API service layer
│   ├── contexts/               # React contexts (Auth)
│   └── utils/                  # Utility functions
```

### Backend (FastAPI + Python)
```
BlueShield-backend/
├── app/
│   ├── api/v1/endpoints/       # REST API endpoints
│   ├── core/                   # Authentication & middleware
│   ├── models/                 # Database models (MongoDB)
│   ├── schemas/                # Pydantic schemas
│   ├── services/               # Business logic
│   │   ├── ml/                 # Machine learning services
│   │   ├── chatbot/            # AI chatbot functionality
│   │   ├── data/               # Data processing
│   │   ├── location/           # Geospatial services
│   │   └── risk_assessment/    # Risk evaluation
│   └── utils/                  # Utility functions
```

## Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.3 | React framework with app router |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 4.1.13 | Utility-first CSS framework |
| **Leaflet.js** | 1.9.4 | Interactive mapping library |
| **React Leaflet** | 5.0.0 | React components for Leaflet |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.104.1 | High-performance web framework |
| **MongoDB** | 7.0 | NoSQL database for scalability |
| **Beanie ODM** | Latest | MongoDB object-document mapper |
| **JWT** | Latest | Secure authentication |
| **Pydantic** | Latest | Data validation and serialization |

### Machine Learning & Data
| Technology | Purpose |
|------------|---------|
| **TensorFlow/Keras** | LSTM model development |
| **Pandas/NumPy** | Data processing and analysis |
| **LiteLLM** | Large language model integration |
| **Vector Database** | RAG (Retrieval-Augmented Generation) |
| **Satellite Data** | Environmental variable integration |

##  Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+
- MongoDB 7.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/BlueShield.git
   cd BlueShield
   ```

2. **Set up the Backend**
   ```bash
   cd BlueShield-backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp env.example .env
   # Edit .env with your configuration
   uvicorn app.main:app --reload
   ```

3. **Set up the Frontend**
   ```bash
   cd blueshield-frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: YET TO BE DEPLOYED
   - Backend API: YET TO BE DEPLOYED
   - API Documentation: YET TO BE DEPLOYED

##  Key Features in Detail

###  Interactive Microplastic Prediction Map
- Click anywhere on the Bay of Bengal to get real-time MP concentration predictions
- Color-coded risk indicators (Red: High, Amber: Medium, Green: Low)
- Detailed popup information with confidence scores and environmental factors
- Historical data visualization and trend analysis

###  AI-Powered Risk Assessment Chatbot
- Personalized health risk evaluation based on dietary patterns
- Integration with toxicological databases and research papers
- Context-aware responses using RAG (Retrieval-Augmented Generation)
- Secure user data handling and privacy protection

###  Advanced Analytics Dashboard
- Real-time microplastic concentration monitoring
- Geospatial hotspot detection using DBSCAN clustering
- Time-series visualization of pollution trends
- Export capabilities for research and policy development

##  Scientific Approach

### Data Sources
- **Historical MP Data**: Oceanographic research datasets
- **Auxiliary Datasets**: Temperature, salinity, ocean currents
- **Toxicological Studies**: Academic literature and research papers

### Machine Learning Models
- **LSTM Networks**: Time-series forecasting of MP concentrations
- **Mathematical Models**: Bioaccumulation estimation in marine species
- **Risk Assessment Models**: Human health impact evaluation
- **Clustering Algorithms**: Geospatial hotspot identification

##  Environmental Impact

BlueShield contributes to environmental protection by:

- **Monitoring**: Continuous tracking of microplastic pollution patterns
- **Prediction**: Early warning systems for high-risk areas
- **Research**: Supporting scientific research with accessible data
- **Policy**: Informing environmental policy decisions
- **Awareness**: Raising public awareness through interactive tools

## 🔮 Future Enhancements

### Planned Features
- **Global Coverage**: Expand beyond Bay of Bengal to global oceans
- **Advanced AI**: Integration with more sophisticated language models
- **Research Tools**: Advanced analytics for researchers
- **Public Dashboard**: Open data platform for public access

### Technical Improvements
- **Performance**: On-device ML inference for faster predictions
- **Security**: Enhanced data encryption and privacy protection
- **Scalability**: Microservices architecture for better scaling
- **API**: Public API for third-party integrations

##  Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- Oceanographic research community for data and insights
- Open source contributors and maintainers
- Environmental organizations and researchers
- Academic institutions and research partners

##  Contact

- **Project Lead**: [Your Name](mailto:your.email@example.com)
- **GitHub Issues**: [Report bugs or request features](https://github.com/Nithin6524/BlueShield/issues)

---

**BlueShield** - Protecting our oceans, one prediction at a time. 
