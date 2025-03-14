const express = require('express');
const router = express.Router();
const { analyzePsychometricResponses } = require('../services/gemini');

/**
 * @route   POST /api/psychometric/analyze
 * @desc    Analyze psychometric test responses
 * @access  Public
 */
router.post('/analyze', async (req, res) => {
  try {
    const { responses } = req.body;
    
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ error: 'Valid responses are required' });
    }
    
    // Analyze responses using Gemini
    const analysis = await analyzePsychometricResponses(responses);
    
    res.json({
      analysis
    });
  } catch (error) {
    console.error('Psychometric analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze psychometric responses' });
  }
});

/**
 * @route   GET /api/psychometric/questions
 * @desc    Get psychometric test questions
 * @access  Public
 */
router.get('/questions', (req, res) => {
  // In a production app, these would typically be stored in a database
  // These are simplified examples
  const questions = [
    {
      id: 1,
      type: 'visual-choice',
      question: 'Which image best represents how you approach challenges?',
      options: [
        { id: 'a', imageUrl: '/images/psychometric/challenge_methodical.jpg', label: 'Methodical approach' },
        { id: 'b', imageUrl: '/images/psychometric/challenge_creative.jpg', label: 'Creative approach' },
        { id: 'c', imageUrl: '/images/psychometric/challenge_collaborative.jpg', label: 'Collaborative approach' },
        { id: 'd', imageUrl: '/images/psychometric/challenge_instinctive.jpg', label: 'Instinctive approach' }
      ]
    },
    {
      id: 2,
      type: 'scenario',
      question: 'In a business setting with limited resources, which path would you choose?',
      options: [
        { id: 'a', imageUrl: '/images/psychometric/business_innovative.jpg', label: 'Find an innovative workaround' },
        { id: 'b', imageUrl: '/images/psychometric/business_methodical.jpg', label: 'Carefully allocate existing resources' },
        { id: 'c', imageUrl: '/images/psychometric/business_partnership.jpg', label: 'Seek partnerships to pool resources' },
        { id: 'd', imageUrl: '/images/psychometric/business_pivot.jpg', label: 'Pivot to a less resource-intensive approach' }
      ]
    },
    {
      id: 3,
      type: 'visual-choice',
      question: 'Which workspace environment would you be most productive in?',
      options: [
        { id: 'a', imageUrl: '/images/psychometric/workspace_organized.jpg', label: 'Organized and structured' },
        { id: 'b', imageUrl: '/images/psychometric/workspace_creative.jpg', label: 'Creative and stimulating' },
        { id: 'c', imageUrl: '/images/psychometric/workspace_collaborative.jpg', label: 'Open and collaborative' },
        { id: 'd', imageUrl: '/images/psychometric/workspace_minimal.jpg', label: 'Minimal and focused' }
      ]
    },
    {
      id: 4,
      type: 'scenario',
      question: 'When faced with a new market opportunity, how would you respond?',
      options: [
        { id: 'a', imageUrl: '/images/psychometric/opportunity_research.jpg', label: 'Conduct extensive research' },
        { id: 'b', imageUrl: '/images/psychometric/opportunity_quick.jpg', label: 'Move quickly to capture market share' },
        { id: 'c', imageUrl: '/images/psychometric/opportunity_cautious.jpg', label: 'Test the waters with minimal investment' },
        { id: 'd', imageUrl: '/images/psychometric/opportunity_partners.jpg', label: 'Find partners with complementary strengths' }
      ]
    },
    {
      id: 5,
      type: 'visual-choice',
      question: 'Which image best represents your approach to financial management?',
      options: [
        { id: 'a', imageUrl: '/images/psychometric/finance_growth.jpg', label: 'Focus on growth' },
        { id: 'b', imageUrl: '/images/psychometric/finance_balance.jpg', label: 'Balanced approach' },
        { id: 'c', imageUrl: '/images/psychometric/finance_conservative.jpg', label: 'Conservative and careful' },
        { id: 'd', imageUrl: '/images/psychometric/finance_innovative.jpg', label: 'Innovative funding methods' }
      ]
    }
  ];

  res.json({ questions });
});

module.exports = router; 