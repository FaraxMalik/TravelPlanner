# 🌍 AI-Powered Travel Itinerary Generator

An intelligent travel planning system that creates personalized itineraries based on user preferences and real-time data using AI/ML technologies.

## 📋 Project Overview

This system combines modern web development with artificial intelligence to generate customized travel plans. It uses large language models (LLMs) for natural language generation and machine learning for continuous personalization based on user feedback.

### 🏗️ Architecture

- **Backend**: Node.js + Express.js + MongoDB
- **Frontend**: React.js (coming soon)
- **Database**: MongoDB Atlas
- **AI/ML**: LLM integration + TensorFlow/scikit-learn
- **External APIs**: Google Places, WeatherAPI

### ✨ Key Features

- 🤖 AI-generated personalized travel itineraries
- 🌤️ Real-time weather and location data integration
- 📊 Machine learning-based user preference analysis
- 🔄 Continuous learning from user feedback
- 🛡️ Secure authentication and data handling
- 📱 Responsive user interface

## 🚀 Getting Started

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm or yarn
- MongoDB Atlas account
- Git

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TravelPlanner
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```

3. **Environment Configuration**
   
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
