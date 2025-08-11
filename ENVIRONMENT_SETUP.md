# Environment Setup Guide

## Quick Setup for New Deployments

When you pull this code to a new environment, follow these steps:

### 1. Backend Environment Setup

```bash
# Navigate to Backend directory
cd Backend

# Copy the example environment file
cp .env.example .env

# Edit the .env file with your actual values
# Use your preferred text editor (nano, vim, vscode, etc.)
nano .env
```

### 2. Required Environment Variables

Fill in these required values in your `.env` file:

#### Essential (Required for basic functionality)
- `JWT_SECRET`: A strong, random secret key for JWT tokens
- `MONGODB_URI`: Your MongoDB connection string
- `GEMINI_API_KEY`: Google Gemini AI API key
- `GROQ_API_KEY`: Groq AI API key

#### Optional (For enhanced features)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`: For email functionality
- `PYTHON_ML_SERVICE_URL`: If using Python ML services

### 3. Getting API Keys

#### Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

#### Groq API Key
1. Go to [Groq Console](https://console.groq.com/)
2. Sign up/Login
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

### 4. Security Best Practices

- **Never commit `.env` files** to version control
- **Use strong, random JWT secrets** in production
- **Rotate API keys regularly**
- **Use different secrets** for different environments (dev, staging, prod)

### 5. Example Commands for Different Environments

#### Development
```bash
# Copy and modify for development
cp .env.example .env
# Edit .env with development values
```

#### Production
```bash
# Use environment-specific values
# Consider using environment variables directly instead of .env files
export JWT_SECRET="your-production-secret"
export MONGODB_URI="your-production-db-connection"
```

### 6. Verification

After setting up your environment variables, test the connection:

```bash
# Install dependencies
npm install

# Test the server starts without errors
npm run dev
```

If you see "✅ Connected to MongoDB" and no JWT_SECRET errors, you're good to go!

### 7. Troubleshooting

- **JWT_SECRET error**: Make sure you've copied `.env.example` to `.env` and filled in the JWT_SECRET
- **MongoDB connection error**: Verify your MONGODB_URI is correct and MongoDB is running
- **API errors**: Check that your GEMINI_API_KEY and GROQ_API_KEY are valid

### 8. Environment Variables Checklist

Before running the application, ensure you have:
- [ ] Copied `.env.example` to `.env`
- [ ] Set a strong `JWT_SECRET`
- [ ] Configured `MONGODB_URI`
- [ ] Added `GEMINI_API_KEY`
- [ ] Added `GROQ_API_KEY`
- [ ] Set appropriate `CLIENT_URL` for your frontend
- [ ] Verified all values are correct
