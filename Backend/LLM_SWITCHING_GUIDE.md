# 🔄 LLM Switching Guide: Gemini ↔ Groq

## 🚀 Quick Switch Instructions

### To Use **Gemini**:
1. **Set your Gemini API key** in `.env`:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. **In `controllers/aiTravelController.js` line 15-16**, uncomment Gemini:
   ```javascript
   this.activeService = this.geminiService;  // ✅ UNCOMMENT to use Gemini
   // this.activeService = this.groqService;     // ❌ COMMENT this line
   ```

### To Use **Groq**:
1. **Set your Groq API key** in `.env`:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

2. **In `controllers/aiTravelController.js` line 15-16**, uncomment Groq:
   ```javascript
   // this.activeService = this.geminiService;  // ❌ COMMENT this line
   this.activeService = this.groqService;     // ✅ UNCOMMENT to use Groq
   ```

## 🎯 Why This Setup?

- **Same Prompts**: Both services use identical prompts for consistent results
- **Same Response Format**: Both return the same JSON structure
- **Easy Switching**: Just comment/uncomment 2 lines to switch
- **No Code Duplication**: Shared formatting and parsing logic
- **Backup Ready**: If one service hits limits, quickly switch to the other

## 📋 What Each Service Offers:

### **Gemini 1.5 Flash**
- ✅ Very fast responses
- ✅ Good at following JSON format
- ✅ Free tier: 15 RPM, 1M TPM, 1500 RPD
- ✅ Excellent travel knowledge

### **Groq (Llama 3.3 70B Versatile)**
- ✅ Extremely fast inference (fastest available)
- ✅ Latest Llama 3.3 model with improved capabilities
- ✅ Excellent JSON compliance
- ✅ Superior reasoning and travel planning
- ✅ **CONFIGURED AND READY TO USE**

## 🔧 Current Configuration:
- **Active Service**: Gemini (default)
- **Fallback Logic**: Built-in for both services
- **Error Handling**: Graceful degradation
- **Frontend Compatibility**: Same data structure for both

## 🧪 Testing Your Switch:
```bash
# Test current active service
node -e "const controller = require('./controllers/aiTravelController'); console.log('Active service:', controller.activeService.constructor.name);"
```

## 🎉 Benefits:
1. **Never blocked**: Switch when hitting API limits
2. **Cost optimization**: Use whichever is cheaper
3. **Performance**: Compare response times
4. **Reliability**: Backup if one service is down
5. **Easy maintenance**: No complex configuration files