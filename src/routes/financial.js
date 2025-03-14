const express = require('express');
const router = express.Router();
const { sendMessage, initChatSession, testGeminiAPI } = require('../services/gemini');

// In-memory store for chat sessions (in a production app, you'd use a database)
const chatSessions = {};

/**
 * @route   GET /api/financial/test-gemini
 * @desc    Test the Gemini API connection
 * @access  Public
 */
router.get('/test-gemini', async (req, res) => {
  try {
    const isWorking = await testGeminiAPI();
    
    res.json({
      success: isWorking,
      message: isWorking 
        ? 'Gemini API is working correctly' 
        : 'Gemini API is not working. The application is using mock responses.'
    });
  } catch (error) {
    console.error('Error testing Gemini API:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to test Gemini API',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/financial/chat
 * @desc    Send a message to the financial assistant
 * @access  Public
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get existing session or create a new one
    let chatSession = null;
    if (sessionId && chatSessions[sessionId]) {
      chatSession = chatSessions[sessionId];
    }
    
    // Prepare a financial context prompt
    const contextualMessage = `User Question: ${message}
    
    Context: You are a helpful financial planning assistant for microfinance customers and individuals from underserved communities in India. Provide personalized, simple, and practical financial advice tailored to the Indian context. 
    
    Consider these Indian-specific factors:
    - Refer to currency in INR or Rupees (₹), never use $ signs
    - Mention relevant Indian financial schemes like Jan Dhan Yojana, PM Jeevan Jyoti Bima Yojana, Atal Pension Yojana, etc. when appropriate
    - Reference Indian financial institutions like SBI, post offices, small finance banks, and microfinance institutions
    - Consider the reality of the informal economy and daily wage workers
    - Acknowledge cultural aspects like family financial interdependence and gold as a store of value
    - Mention digital payment options popular in India like UPI, BHIM, Google Pay, PhonePe, etc.
    
    Focus on basic financial concepts, budgeting, saving, and responsible borrowing. Avoid complex investment strategies and focus on actionable, accessible advice for people with limited resources. Be empathetic and considerate of financial constraints while remaining positive and empowering. Use simple language and avoid jargon. Be conversational and friendly in your tone.`;
    
    // Send message to Gemini
    const response = await sendMessage(contextualMessage, chatSession);
    
    // Create a new session ID if needed
    const newSessionId = sessionId || Date.now().toString();
    chatSessions[newSessionId] = response.session;
    
    res.json({
      response: response.text,
      sessionId: newSessionId
    });
  } catch (error) {
    console.error('Financial chat error:', error);
    res.status(500).json({ error: 'Failed to get financial advice' });
  }
});

module.exports = router; 