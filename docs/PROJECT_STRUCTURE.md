# Travel Planner - Project Structure

This document outlines the complete structure and organization of the Travel Planner application.

## 📁 Root Directory Structure

```
TravelPlanner/
├── Backend/                          # Node.js backend server
├── Frontend/                         # React frontend application  
├── docs/                             # Project documentation
├── .gitignore                        # Git ignore rules
└── README.md                         # Main project documentation
```

## 🔧 Backend Structure

```
Backend/
├── config/                           # Configuration files
│   ├── database.js                   # MongoDB connection setup
│   ├── new_travel_questions.json     # Latest questionnaire data
│   ├── travel_questions_12_clean.json # Clean questionnaire format
│   └── travel_questions_12.json      # Original questionnaire data
├── controllers/                      # Business logic controllers
│   ├── aiTravelController.js         # Main AI travel controller
│   ├── aiTravelController_backup.js  # Backup version
│   ├── aiTravelController_clean.js   # Clean version
│   ├── authController.js             # Authentication logic
│   ├── feedbackController.js         # User feedback handling
│   ├── preferenceController.js       # User preferences
│   └── tourController.js             # Tour plan management
├── middlewares/                      # Express middlewares
│   └── authMiddleware.js             # JWT authentication middleware
├── ml_models/                        # Machine Learning models
│   ├── models/                       # Trained model files
│   │   ├── travel_personality_model.pkl    # Random Forest model (2MB)
│   │   ├── preference_scaler.pkl           # Feature scaler (1KB)
│   │   ├── model_metadata.json             # Model configuration
│   │   └── preference_simulator.json       # Model metadata
│   ├── scripts/                      # ML prediction scripts
│   │   └── predict_personality.py    # Main prediction script
│   └── README.md                     # ML documentation
├── models/                           # MongoDB data models
│   ├── feedback.js                   # Feedback schema
│   ├── tourPlan.js                   # Tour plan schema
│   └── user.js                       # User schema
├── routes/                           # API route definitions
│   ├── aiTravelRoutes.js             # AI/ML endpoints
│   ├── authRoutes.js                 # Authentication endpoints
│   ├── feedbackRoutes.js             # Feedback endpoints
│   ├── preferenceRoutes.js           # Preference endpoints
│   └── tourRoutes.js                 # Tour management endpoints
├── utils/                            # Utility services
│   ├── bigFiveService.js             # ML model integration
│   ├── geminiTravelService.js        # Gemini AI service
│   └── generateJWT.js                # JWT token generation
├── .env                              # Environment variables
├── package.json                      # Dependencies and scripts
├── package-lock.json                 # Locked dependency versions
└── server.js                         # Main server entry point
```

## ⚛️ Frontend Structure

```
Frontend/
└── travelPlanner/                    # React application
    ├── src/                          # Source code
    │   ├── components/               # Reusable React components
    │   │   ├── Navbar.jsx            # Navigation component
    │   │   ├── PreferencesQuestionnaire.jsx          # Basic questionnaire
    │   │   ├── PreferencesQuestionnaireEnhanced.jsx  # Enhanced questionnaire
    │   │   ├── TestComponent.jsx     # Testing component
    │   │   ├── Auth.css              # Authentication styles
    │   │   ├── Navbar.css            # Navigation styles
    │   │   ├── Preferences.css       # Basic preferences styles
    │   │   └── PreferencesEnhanced.css # Enhanced preferences styles
    │   ├── context/                  # React context providers
    │   │   └── AuthContext.jsx       # Authentication context
    │   ├── pages/                    # Page components
    │   │   ├── Dashboard.jsx         # Basic dashboard
    │   │   ├── DashboardEnhanced.jsx # Enhanced dashboard
    │   │   ├── Homepage.jsx          # Landing page
    │   │   ├── PlanTrip.jsx          # Basic trip planning
    │   │   ├── PlanTripEnhanced.jsx  # Enhanced trip planning
    │   │   ├── SignIn.jsx            # Sign in page
    │   │   ├── SignUp.jsx            # Sign up page
    │   │   ├── Dashboard.css         # Basic dashboard styles
    │   │   ├── DashboardEnhanced.css # Enhanced dashboard styles
    │   │   ├── PlanTrip.css          # Basic trip planning styles
    │   │   └── PlanTripEnhanced.css  # Enhanced trip planning styles
    │   ├── services/                 # API service layer
    │   │   └── api.js                # API calls and configuration
    │   ├── App.jsx                   # Main App component
    │   ├── index.css                 # Global styles
    │   └── main.jsx                  # React entry point
    ├── public/                       # Static assets
    │   └── vite.svg                  # Vite logo
    ├── index.html                    # HTML template
    ├── package.json                  # Dependencies and scripts
    ├── vite.config.js                # Vite configuration
    ├── eslint.config.js              # ESLint configuration
    └── README.md                     # Frontend documentation
```

## 📚 Documentation Structure

```
docs/
├── API_DOCUMENTATION.md              # Complete API documentation
└── PROJECT_STRUCTURE.md              # This file
```

## 🔄 Data Flow

### 1. User Registration & Authentication
```
Frontend → POST /api/auth/register → MongoDB → JWT Token → Frontend
Frontend → POST /api/auth/login → Verify Credentials → JWT Token
```

### 2. Personality Analysis
```
Frontend → POST /api/ai/analyze-personality → BigFiveService → ML Model → MongoDB
User Answers (12 questions) → Python Script → Trained Model → Personality Type
```

### 3. Trip Planning
```
Frontend → POST /api/ai/generate-itinerary → Load User Personality → Gemini AI
Stored Personality + Trip Request → Gemini Service → Personalized Itinerary
```

### 4. Data Storage
```
User Data → MongoDB (users collection)
├── preferences: User's 12 questionnaire answers
├── personalityAnalysis: ML model predictions
└── readyForPersonalizedPlanning: Boolean flag
```

## 🚀 Key Features

### Machine Learning Integration
- **Model**: Random Forest Classifier (50 trees, max depth 10)
- **Training Data**: 1M+ personality records from Big Five dataset
- **Input**: 12 travel preference questions (1-4 scale)
- **Output**: 10 travel personality types
- **Size**: ~2MB total model files

### Personality Types Predicted
1. **Cultural_Explorer** - Museums, art galleries, historical sites
2. **Adventure_Seeker** - Hiking, extreme sports, outdoor activities
3. **Luxury_Seeker** - Fine dining, luxury hotels, premium experiences
4. **Social_Party_Goer** - Nightlife, social events, group activities
5. **Nature_Lover** - National parks, wildlife, natural environments
6. **Budget_Backpacker** - Street food, hostels, authentic experiences
7. **Family_Oriented** - Family attractions, safe environments
8. **Solo_Adventurer** - Independent travel, unique experiences
9. **Relaxation_Seeker** - Spas, quiet beaches, wellness retreats
10. **History_Buff** - Historical sites, museums, cultural heritage

### AI Integration
- **Gemini API**: Google's generative AI for trip planning
- **Personalization**: Uses ML-predicted personality types
- **Output**: Detailed day-by-day itineraries with hotels, restaurants, activities

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **ML Integration**: Python subprocess calls
- **AI**: Google Gemini API

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: CSS modules
- **Animations**: Framer Motion
- **HTTP Client**: Axios

### Machine Learning
- **Language**: Python
- **Algorithm**: Random Forest (scikit-learn)
- **Features**: StandardScaler preprocessing
- **Format**: Pickle serialization

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user

### AI & ML
- `POST /api/ai/analyze-personality` - Personality analysis
- `POST /api/ai/generate-itinerary` - Generate trip plan
- `GET /api/ai/personality` - Get user personality

### Preferences
- `POST /api/preferences/submit` - Submit preferences
- `GET /api/preferences/questions` - Get questionnaire

## 🔒 Security Features

- JWT-based authentication
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- Environment variable protection
- CORS configuration

## 📦 Deployment Ready

- **Environment**: Production-ready configurations
- **Logging**: Comprehensive error logging
- **Health Checks**: Server health monitoring
- **Graceful Shutdown**: Proper process handling
- **Port Management**: Automatic port detection

---

This structure provides a complete, production-ready travel planning application with advanced ML-driven personality prediction and AI-powered trip generation.