# Financial Chatbot Backend

This is the backend API for the Financial Chatbot application, built with Node.js and Express.

## Deployment Options

### Render (Recommended)

1. Sign up for a Render account at [render.com](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the build settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Set up environment variables:
   - PORT: 10000 (or any port Render assigns)
   - NODE_ENV: production
   - GEMINI_API_KEY: Your Google Gemini API key
   - CORS_ORIGIN: Your Netlify frontend URL (e.g., https://your-app.netlify.app)
6. Click "Create Web Service"

### Heroku

1. Sign up for a Heroku account at [heroku.com](https://www.heroku.com/)
2. Install the Heroku CLI:
   ```
   npm install -g heroku
   ```
3. Login to Heroku:
   ```
   heroku login
   ```
4. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```
5. Set environment variables:
   ```
   heroku config:set NODE_ENV=production
   heroku config:set GEMINI_API_KEY=your-api-key
   heroku config:set CORS_ORIGIN=your-netlify-url
   ```
6. Deploy the app:
   ```
   git push heroku main
   ```

### Railway

1. Sign up for a Railway account at [railway.app](https://railway.app/)
2. Create a new project
3. Connect your GitHub repository
4. Set up environment variables:
   - PORT: 10000 (or any port Railway assigns)
   - NODE_ENV: production
   - GEMINI_API_KEY: Your Google Gemini API key
   - CORS_ORIGIN: Your Netlify frontend URL
5. Deploy the app

## Environment Variables

The following environment variables need to be set:

- `PORT`: The port the server will run on (usually assigned by the hosting platform)
- `NODE_ENV`: Set to 'production' for production environments
- `GEMINI_API_KEY`: Your Google Gemini API key
- `CORS_ORIGIN`: The URL of your frontend (e.g., https://your-app.netlify.app)

## API Endpoints

- `GET /health`: Health check endpoint
- `GET /test`: Test endpoint to verify server functionality
- `POST /api/financial/chat`: Send a message to the financial chatbot
- `GET /api/psychometric/questions`: Get psychometric test questions
- `POST /api/psychometric/analyze`: Analyze psychometric test responses 