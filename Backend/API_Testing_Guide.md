# 🧪 Travel Planner API Testing Guide

## 📋 **Quick Setup**

### 1. **Import Postman Collection**
- Open Postman
- Click "Import" → "File" → Select `TravelPlanner_API_Collection.json`
- The collection will be imported with all endpoints pre-configured

### 2. **Server Status**
- **Server URL**: `http://localhost:5000`
- **Status**: ✅ Running
- **Database**: ✅ Connected to MongoDB Atlas

---

## 🚀 **Testing Sequence**

### **Step 1: Health Check**
```
GET http://localhost:5000/api/health
```
**Expected Response**: 200 OK
```json
{
  "status": "OK",
  "message": "Server is healthy",
  "database": "Connected",
  "timestamp": "2024-01-18T..."
}
```

### **Step 2: Root Endpoint**
```
GET http://localhost:5000/
```
**Expected Response**: 200 OK
```json
{
  "message": "Travel Planner API is running!",
  "status": "success",
  "timestamp": "2024-01-18T..."
}
```

---

## 🔐 **Authentication Testing**

### **Step 3: Register New User**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "preferences": {
    "interests": ["museums", "nature", "food"],
    "budget": 5000,
    "duration": 7
  }
}
```
**Expected Response**: 201 Created
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "preferences": {...},
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### **Step 4: Login with Test User**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "testpassword123"
}
```
**Expected Response**: 200 OK
```json
{
  "_id": "...",
  "name": "Test User",
  "email": "test@example.com",
  "preferences": {...},
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### **Step 5: Get User Profile**
```
GET http://localhost:5000/api/user/me
Authorization: Bearer {{authToken}}
```
**Expected Response**: 200 OK
```json
{
  "_id": "...",
  "name": "Test User",
  "email": "test@example.com",
  "preferences": {...},
  "tours": [...],
  "createdAt": "2024-01-18T...",
  "updatedAt": "2024-01-18T..."
}
```

---

## 🧭 **Tour Management Testing**

### **Step 6: Create Tour Plan**
```
POST http://localhost:5000/api/tours/create
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "placeName": "Paris, France",
  "budget": 3000,
  "numberOfDays": 5,
  "suggestedPlaces": [
    "Eiffel Tower",
    "Louvre Museum",
    "Notre-Dame Cathedral",
    "Champs-Élysées",
    "Arc de Triomphe"
  ],
  "itinerary": [
    {
      "day": 1,
      "activities": [
        "Arrive in Paris",
        "Visit Eiffel Tower",
        "Evening Seine River cruise"
      ]
    },
    {
      "day": 2,
      "activities": [
        "Louvre Museum",
        "Tuileries Garden",
        "Champs-Élysées walk"
      ]
    }
  ],
  "weatherForecast": [
    {
      "date": "2024-01-15",
      "temperature": "15°C",
      "conditions": "Partly Cloudy"
    },
    {
      "date": "2024-01-16",
      "temperature": "12°C",
      "conditions": "Sunny"
    }
  ]
}
```
**Expected Response**: 201 Created
```json
{
  "message": "Tour plan created successfully",
  "tourPlan": {
    "_id": "...",
    "userId": "...",
    "placeName": "Paris, France",
    "budget": 3000,
    "numberOfDays": 5,
    "suggestedPlaces": [...],
    "itinerary": [...],
    "weatherForecast": [...],
    "createdAt": "2024-01-18T...",
    "updatedAt": "2024-01-18T..."
  }
}
```

### **Step 7: Get User Tour Plans**
```
GET http://localhost:5000/api/tours/myplans
Authorization: Bearer {{authToken}}
```
**Expected Response**: 200 OK
```json
{
  "count": 1,
  "tours": [
    {
      "_id": "...",
      "placeName": "Paris, France",
      "budget": 3000,
      "numberOfDays": 5,
      "suggestedPlaces": [...],
      "itinerary": [...],
      "weatherForecast": [...],
      "createdAt": "2024-01-18T...",
      "updatedAt": "2024-01-18T..."
    }
  ]
}
```

---

## ❌ **Error Testing**

### **Step 8: Login with Wrong Password**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "wrongpassword"
}
```
**Expected Response**: 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```

### **Step 9: Access Protected Route Without Token**
```
GET http://localhost:5000/api/user/me
```
**Expected Response**: 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```

### **Step 10: Create Tour Without Required Fields**
```
POST http://localhost:5000/api/tours/create
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "placeName": "",
  "budget": -100
}
```
**Expected Response**: 400 Bad Request
```json
{
  "message": "Please provide placeName, budget, and numberOfDays"
}
```

---

## 🎯 **Testing Checklist**

- [ ] **Health Check** - Server is running
- [ ] **Root Endpoint** - Basic API response
- [ ] **User Registration** - Create new account
- [ ] **User Login** - Authenticate with credentials
- [ ] **Get Profile** - Retrieve user data
- [ ] **Create Tour** - Add new tour plan
- [ ] **Get Tours** - List user's tour plans
- [ ] **Error Handling** - Test invalid inputs
- [ ] **Authentication** - Test protected routes

---

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Port 5000 Busy**
   - The server automatically finds available ports
   - Check console output for actual port number
   - Update `baseUrl` variable in Postman

2. **Authentication Errors**
   - Ensure token is properly set in collection variables
   - Check if token is expired (7 days default)
   - Verify Authorization header format: `Bearer <token>`

3. **Database Connection**
   - Check MongoDB Atlas connection
   - Verify `.env` file configuration
   - Ensure network access is allowed

### **Test Credentials:**
- **Email**: `test@example.com`
- **Password**: `testpassword123`

---

## ✅ **Success Criteria**

All tests should return:
- ✅ **200/201** status codes for successful operations
- ✅ **401** for unauthorized access
- ✅ **400** for validation errors
- ✅ **Proper JSON responses** with expected data structure
- ✅ **JWT tokens** for authentication
- ✅ **Database persistence** of created data

**🎉 If all tests pass, your Travel Planner API is fully functional!** 