const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize the Gemini API
const apiKey = process.env.GEMINI_API_KEY;

// Check if API key exists
if (!apiKey) {
  console.error('GEMINI_API_KEY not found in environment variables');
} else {
  console.log('GEMINI_API_KEY found in environment variables');
  console.log('API Key length:', apiKey.length);
  console.log('API Key first 4 chars:', apiKey.substring(0, 4));
  console.log('API Key last 4 chars:', apiKey.substring(apiKey.length - 4));
}

// Create a mock response generator for development/testing
const createMockResponse = (query) => {
  console.log('Using mock response generator for query:', query);
  
  // Simple financial advice responses
  const financialResponses = {
    budget: "Creating a budget is simple! Start by tracking your income and expenses for a month. Then, categorize your expenses (housing, food, transportation, etc.) and set spending limits for each category. Aim to save at least 10% of your income if possible. Review and adjust your budget regularly.",
    saving: "To save money with a low income, try these tips: 1) Track every expense, 2) Cut unnecessary subscriptions, 3) Use cash instead of cards to be more mindful of spending, 4) Cook at home instead of eating out, 5) Look for free entertainment options, 6) Consider a side hustle for extra income.",
    debt: "To manage debt effectively: 1) List all your debts with interest rates, 2) Pay minimum payments on all debts, 3) Put extra money toward the highest-interest debt first, 4) Consider debt consolidation if you have good credit, 5) Contact creditors to negotiate lower rates, 6) Create a budget to avoid taking on more debt.",
    investing: "Start investing with little money by: 1) Using micro-investing apps like Acorns or Stash, 2) Contributing to an employer-matched retirement plan if available, 3) Looking into low-cost index funds with low minimum investments, 4) Setting up automatic transfers of small amounts regularly, 5) Reinvesting any dividends you earn.",
    emergency: "An emergency fund is money set aside for unexpected expenses like medical bills, car repairs, or job loss. Aim to save 3-6 months of essential expenses. Start small with a goal of ₹5,000-₹10,000, then build from there. Keep this money in a separate savings account that's easily accessible but not connected to your checking account."
  };
  
  // Check for keywords in the query
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('budget')) return financialResponses.budget;
  if (lowerQuery.includes('save') || lowerQuery.includes('saving')) return financialResponses.saving;
  if (lowerQuery.includes('debt')) return financialResponses.debt;
  if (lowerQuery.includes('invest')) return financialResponses.investing;
  if (lowerQuery.includes('emergency')) return financialResponses.emergency;
  
  // Default response
  return "To improve your financial situation, focus on creating a budget, reducing expenses, paying down debt, and building an emergency fund. Start small and be consistent with your financial habits. Every small step counts toward building a more secure financial future.";
};

// Initialize the Gemini API client
let genAI = null;
try {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('GoogleGenerativeAI initialized successfully');
} catch (error) {
  console.error('Error initializing GoogleGenerativeAI:', error.message);
}

// Configuration for the Gemini model
const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 4096
};

// Fallback responses for development/error cases
const FALLBACK_RESPONSES = {
  financial: "I'm sorry, I couldn't process your financial question at the moment. Please try again later or check your connection.",
  psychometric: {
    score: 7,
    strengths: [
      "Problem-solving abilities",
      "Adaptability to changing situations",
      "Willingness to learn new skills"
    ],
    areasForDevelopment: [
      "Strategic planning",
      "Financial management",
      "Delegation of responsibilities"
    ],
    advice: "Focus on developing a structured approach to business planning. Consider taking courses on financial literacy and management.",
    resources: [
      "Small Business Administration (SBA) courses",
      "Local entrepreneurship workshops",
      "Online financial planning tools"
    ]
  }
};

/**
 * Initialize a chat session with the Gemini model
 * @returns {Object} - Chat session object
 */
const initChatSession = () => {
  if (!genAI || !apiKey) {
    console.log('Cannot initialize chat session due to missing API key or initialization error');
    return null;
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    return model.startChat({
      generationConfig,
      history: [],
    });
  } catch (error) {
    console.error('Error initializing chat session:', error.message);
    return null;
  }
};

/**
 * Send a message to the Gemini model
 * @param {string} message - The user message
 * @param {Object} chatSession - Optional existing chat session
 * @returns {Promise<Object>} - Model response and session
 */
const sendMessage = async (message, chatSession = null) => {
  // Extract the user's question from the contextual message
  const userQuestion = message.split('User Question:')[1]?.split('Context:')[0]?.trim() || message;
  
  if (!genAI || !apiKey) {
    console.log('Using mock response due to missing API key or initialization error');
    const mockResponse = createMockResponse(userQuestion);
    return {
      text: mockResponse,
      session: null
    };
  }
  
  try {
    // If no chat session is provided, create a new one
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const session = chatSession || model.startChat({
      generationConfig,
      history: [],
    });
    
    console.log('Sending message to Gemini API...');
    const result = await session.sendMessage(message);
    console.log('Successfully received response from Gemini API');
    
    return {
      text: result.response.text(),
      session: session
    };
  } catch (error) {
    console.error('Error communicating with Gemini API:', error.message);
    
    // Use mock response as a fallback
    console.log('Using mock response as fallback');
    const mockResponse = createMockResponse(userQuestion);
    return {
      text: mockResponse,
      session: null
    };
  }
};

/**
 * Analyze psychometric responses
 * @param {Object} data - User responses to psychometric questions
 * @returns {Promise<Object>} - Analysis of entrepreneurial skills
 */
const analyzePsychometricResponses = async (data) => {
  if (!genAI || !apiKey) {
    console.log('Using fallback psychometric analysis due to missing API key or initialization error');
    return FALLBACK_RESPONSES.psychometric;
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Format the data for analysis
    const promptText = `
    Please analyze these psychometric test responses to assess entrepreneurial potential.
    
    Response Data:
    ${JSON.stringify(data, null, 2)}
    
    Please provide:
    1. An overall entrepreneurial potential score (1-10)
    2. Top 3 strengths
    3. Top 3 areas for development
    4. Specific actionable advice
    5. Suggested resources or next steps
    
    Format the response as JSON with these exact keys: score, strengths, areasForDevelopment, advice, resources
    `;
    
    const result = await model.generateContent(promptText);
    const responseText = result.response.text();
    
    // Parse the JSON response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing Gemini response as JSON:', parseError.message);
      
      // Try to extract JSON from text response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Failed to extract JSON:', e.message);
        }
      }
      
      // Return fallback data in case of parsing error
      return FALLBACK_RESPONSES.psychometric;
    }
  } catch (error) {
    console.error('Error analyzing psychometric responses:', error.message);
    return FALLBACK_RESPONSES.psychometric;
  }
};

/**
 * Test the Gemini API connection
 * @returns {Promise<boolean>} - True if the API is working, false otherwise
 */
const testGeminiAPI = async () => {
  if (!genAI || !apiKey) {
    console.log('Cannot test Gemini API: Missing API key or initialization error');
    return false;
  }
  
  try {
    console.log('Testing Gemini API connection...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const result = await model.generateContent("Hello, please respond with 'API is working' if you can see this message.");
    const text = result.response.text();
    console.log('Gemini API test response:', text);
    
    return text.includes('API is working') || text.length > 10;
  } catch (error) {
    console.error('Gemini API test failed:', error.message);
    return false;
  }
};

// Run a test when the module loads
testGeminiAPI()
  .then(isWorking => {
    console.log('Gemini API working:', isWorking);
    if (!isWorking) {
      console.log('WARNING: Gemini API is not working. The application will use mock responses.');
    }
  })
  .catch(error => {
    console.error('Error testing Gemini API:', error);
  });

module.exports = {
  initChatSession,
  sendMessage,
  analyzePsychometricResponses,
  testGeminiAPI
}; 