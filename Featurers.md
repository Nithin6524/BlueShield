# BlueShield: Microplastic Pollution Prediction & Risk Assessment System

## Abstract

Microplastics (MPs) have emerged as a pervasive environmental pollutant, raising concerns about their ecological impacts and potential risks to human health. This study presents an integrated modeling framework designed to address three critical aspects of MP pollution:

- **Predicting MP concentrations** in seawater using historical data and satellite imagery
- **Estimating MP concentrations** in fish species through a mathematical model derived from academic literature
- **Assessing human health risks** from seafood consumption

Additionally, a chatbot is being developed to facilitate toxicological assessments and enhance accessibility to risk evaluation. This integrated approach not only improves our ability to predict and manage MP pollution but also informs policy decisions aimed at mitigating its ecological and public health consequences.

## Problem Statement

The increasing prevalence of microplastics (MPs) in marine environments poses significant ecological and human health risks. To address this, the project aims to:

1. **Predict MP concentrations** in seawater using historical data, satellite imagery, and auxiliary datasets
2. **Estimate MP concentrations** in fish species using a mathematical model identified from academic literature
3. **Evaluate human exposure and health risks** by quantifying MP concentrations in commercially important seafood and integrating dietary intake patterns with toxicological data

To enhance accessibility and usability, a chatbot is being developed to assist in toxicological assessments, providing insights into potential health risks.

By developing an integrated framework that predicts MP concentrations, estimates bioaccumulation, and evaluates human health risks, the project seeks to provide critical insights into MP pollution dynamics. This will support informed environmental management and policy decisions, ultimately aiming to mitigate the ecological and health impacts of microplastics.

## Scope

### 1. Prediction of MP Concentrations
Utilizing historical MP concentration data, satellite-derived environmental variables, and other auxiliary datasets to forecast MP levels in seawater. This involves developing predictive models that integrate multiple data sources to enhance accuracy and reliability.

### 2. Estimation of MP Bioaccumulation
Estimating MP concentrations in fish species using a mathematical model identified from academic literature. The model accounts for key parameters such as:
- MP concentrations in seawater
- Uptake rates
- Retention times
- Elimination rates

### 3. Human Exposure and Risk Assessment
Evaluating human exposure to MPs through seafood consumption and assessing associated health risks. This includes:
- Quantifying MP concentrations in commercially important seafood species
- Integrating dietary intake patterns with toxicological assessments
- Developing a chatbot to assist in toxicological evaluations and provide insights into potential health risks

---
## Functional Requirements
*What the system must do*

### 🗺️ Microplastic (MP) Prediction System
- Allow users to click on an interactive map to get MP concentration at a specific location
- Fetch and process historical MP concentration data, satellite imagery, and auxiliary datasets for prediction
- Use an LSTM-based time-series model to predict MP concentrations
- Store and retrieve MP concentration predictions in a NoSQL database

### 🤖 Risk Assessment Chatbot
- Allow users to input personal and dietary details through a chatbot UI
- Estimate MP exposure in seafood based on a mathematical model
- Assess health risks using toxicological data
- Provide personalized risk assessment results & mitigation measures
- Log chatbot interactions in a NoSQL database

### ⚙️ Backend Services
- Handle user requests through a FastAPI backend
- Process, store, and fetch data efficiently

### 🔐 Authentication and User Management
- Enable user account creation and login for personalized experience
- Associate prediction results and chatbot logs with authenticated users
- Provide secure access and storage of user-specific data

## Non-Functional Requirements
*How the system should perform*

### 🚀 Performance & Scalability
- The system should respond to user requests within seconds
- Scalable FastAPI backend to handle multiple requests
- Efficient storage & retrieval using NoSQL for prediction & chatbot data

### 🔒 Security
- Ensure user privacy—chatbot interactions should not be shared
- Prevent unauthorized access to the prediction model & database
## 🛠️ Technologies Planned for Use

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js + Tailwind CSS + Leaflet.js | Modern, interactive UI with map-based user interactions |
| **Backend** | FastAPI | High-performance backend web framework for handling user requests |
| **MP Prediction Model** | LSTM | Time-series forecasting of MP concentrations |
| **MP Data Processing** | Python | Extracting and handling numerical data from .nc files |
| **Risk Assessment Chatbot** | ML-based chatbot | Uses toxicological data to assess risks |
| **Database** | MongoDB (NoSQL) | Storing MP predictions & chatbot interaction logs |
| **Storage** | Local Machine | Storing satellite imagery & all dataset files |

---
## 🏗️ Design Approach: Modular, Scalable, and Service-Oriented Architecture

The design is built around modular components—each responsible for a specific functionality, such as:
- **User interaction** (frontend)
- **Prediction** (LSTM-based MP Concentration Model)
- **Exposure estimation** (mathematical model)
- **Risk assessment** (chatbot)

These components communicate via well-defined APIs and are orchestrated by a FastAPI backend. Data storage is handled in a single combined database for prediction results and chatbot interactions, with the flexibility to shift to specialized time-series databases if the data volume increases.

### 🎯 Benefits of this approach:

#### **Modularity**
- **Separation of Concerns**: Each component (frontend, ML models, backend API, database) handles a distinct responsibility, making development, testing, and maintenance easier
- **Flexibility**: Components can be updated, replaced, or scaled independently without affecting the entire system

#### **Scalability**
- **Horizontal Scaling**: Services can be replicated across servers to handle increased load, such as more user requests or more frequent model predictions
- **Future-Proofing**: The system is designed to easily transition to specialized databases (e.g., InfluxDB for time-series data) when data volume grows

#### **Service-Oriented**
- **Loose Coupling**: Independent services communicate over APIs, allowing for easier integration with external systems or the addition of new services
- **Resilience**: Failure in one service does not necessarily bring down the entire system. Services can be monitored and restarted independently
## 🚀 Proposed System / Approach

The project follows a Service-Oriented Architecture (SOA) to ensure modularity, scalability, and maintainability. The core system consists of:

### 🧠 MP Concentration Prediction
Uses an LSTM-based time series model trained on historical MP concentration data, satellite imagery, and auxiliary datasets to predict MP levels.

### 🐟 Seafood Exposure Estimation
Applies a mathematical model to estimate MP concentrations in commercially important seafood species.

### 🤖 Risk Assessment Chatbot
Uses a machine-learning-based chatbot trained on toxicological data to assess health risks based on MP exposure.

### 🗄️ Single Database
Stores prediction results, chatbot interactions, and necessary metadata in a structured format.

### 🌐 Frontend (Web Interface)
Allows users to interact via an interactive map (Leaflet.js) and a chatbot UI.

## 🔮 Additional Enhancements
*Planned or Under Development*

### 🗺️ Geospatial Hotspot Detection
- Implement spatial clustering algorithms (e.g., DBSCAN) to identify high-risk MP zones in marine regions
- Useful for environmental monitoring agencies to prioritize action zones

### ⚠️ Health Risk Severity Grades
- Introduce qualitative risk levels (e.g., Low, Moderate, High, Critical) alongside numerical estimates
- Enhances interpretability and decision-making for end-users and health professionals

### 🔍 Explainability in Risk Model
- Integrate interpretable ML techniques (e.g., SHAP, LIME) to explain which factors most influence individual risk predictions
- Builds user trust and transparency in the model outputs

### 🌍 Public Dashboard Mode
- Launch a simplified public-facing version showing MP concentration zones and health advisory maps
- Increases awareness and promotes community engagement

### 📱 On-Device ML Inference
- Deploy lightweight ML models (e.g., TensorFlow.js, ONNX) directly in the browser for fast, offline inference
- Reduces latency, enables local predictions, and increases user privacy

### 🧠 LiteLLM with RAG Integration
- Use LiteLLM to interface with large language models for efficient querying
- Integrate Retrieval-Augmented Generation (RAG) using a vector database of research papers, policy docs, and toxicological studies
- Enables context-aware answers to user queries while keeping infrastructure lightweight and modular

### 📊 Time-Series Visualization
- Visualize historical and predicted MP concentrations at selected locations over time using interactive charts
- Aids researchers and policymakers in understanding long-term pollution trends and patterns

---

## 🏛️ System Architecture

*[System architecture diagram would be placed here]*