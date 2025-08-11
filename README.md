# 🌍 AI-Powered Travel Planner with Weather Integration

An intelligent travel planning system that creates personalized, weather-aware itineraries using advanced AI, machine learning, and real-time weather data.

## � Features

### 🧠 **Smart Personality Analysis**
- **12-Question Journey Interface**: Interactive questionnaire with animated travel path
- **Big Five Personality Model**: Predicts travel personality from user preferences  
- **Detailed Descriptions**: Rich, natural language personality profiles
- **Travel Style Matching**: Activities and recommendations based on psychological profile

### �️ **Weather-Aware Planning**
- **Real-time Weather Forecasts**: 7-day predictions using Open-Meteo API
- **Smart Activity Adaptation**: Indoor alternatives for rainy days, outdoor activities for sunny weather
- **Clothing & Packing Advice**: Weather-appropriate recommendations
- **Location Intelligence**: Automatic coordinate lookup for any destination

### 🤖 **Enhanced AI Itinerary Generation**  
- **Gemini AI Integration**: Advanced prompt engineering for detailed itineraries
- **Hour-by-Hour Scheduling**: Specific times for meals, activities, and transportation
- **Budget Breakdowns**: Daily cost estimates with realistic pricing
- **Restaurant Recommendations**: Specific dishes and estimated costs
- **Weather Considerations**: Activities adapted to daily conditions

### 🎯 **Complete Integration**
- **React + Framer Motion Frontend**: Smooth animations and modern UI
- **Node.js + Express Backend**: RESTful API with enhanced endpoints  
- **Python ML Pipeline**: Trained models with FastAPI integration
- **MongoDB Database**: User preferences and travel history storage

## 🏗️ Architecture

```
Frontend (React + Framer Motion)
├── 12-Question Travel Questionnaire
├── Journey-Style UI with Dotted Paths  
└── Animated Transitions

Backend (Node.js + Express + MongoDB)
├── Authentication & User Management
├── Enhanced AI Travel Controller
├── Standard API: /api/ai/generate-plan
└── Enhanced API: /api/ai/generate-enhanced-plan

ML Pipeline (Python + scikit-learn)
├── Big Five Personality Prediction  
├── Weather Service Integration
├── Gemini AI Prompt Engineering
└── Complete Backend Integration

External APIs
├── Open-Meteo Weather API
├── Google Gemini AI
└── Geocoding Services
```

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/FaraxMalik/TravelPlanner.git
cd TravelPlanner

# Backend
cd Backend
npm install

# Frontend  
cd ../Frontend/travelPlanner
npm install

# ML Models
cd ../../Backend/ml_models
pip install -r requirements.txt
```

### 2. Environment Setup
```bash
# Backend/.env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

# Backend/ml_models/.env  
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Train ML Models
```bash
cd Backend/ml_models
python detailed_personality_predictor.py
# Creates: personality_model.pkl, travel_classifier.pkl, etc.
```

### 4. Start Services
```bash
# Backend (Terminal 1)
cd Backend  
npm start

# Frontend (Terminal 2)
cd Frontend/travelPlanner
npm run dev

# ML API Server (Terminal 3) - Optional
cd Backend/ml_models
python enhanced_api_server.py
```
   
   Create `Backend/.env` file:
   ```env
   # Database Configuration
   MONGODB_URI=your_mongodb_atlas_connection_string
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Frontend URL
   CLIENT_URL=http://localhost:3000
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   
   # API Keys (to be added later)
   GOOGLE_PLACES_API_KEY=your_google_places_key
   WEATHER_API_KEY=your_weather_api_key
   OPENAI_API_KEY=your_openai_key
   ```

4. **Start the Backend Server**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   ✅ MongoDB Connected: cluster.mongodb.net
   🟢 Mongoose connected to MongoDB Atlas
   🚀 Server running on port 5000
   ```

### 🌐 API Endpoints

#### Health Check
- **GET** `/api/health` - Server health status

#### Coming Soon
- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/login` - User login
- **GET** `/api/itineraries` - Get user itineraries
- **POST** `/api/itineraries/generate` - Generate new itinerary

## 🛠️ Development

### Project Structure
```
TravelPlanner/
├── Backend/
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   ├── Controllers/         # Route handlers
│   ├── Models/             # Database schemas
│   ├── Routes/             # API routes
│   ├── server.js           # Main server file
│   └── package.json        # Dependencies
├── Frontend/               # React.js frontend (coming soon)
└── README.md              # This file
```

### Running in Development

```bash
# Backend development server
cd Backend
npm run dev

# Backend production server
cd Backend
npm start
```

## 🧪 Testing

```bash
# Run tests (coming soon)
cd Backend
npm test
```


## 🔒 Security Features

- Rate limiting
- CORS protection
- Helmet security headers
- JWT authentication
- Input validation
- Environment variable protection



---
