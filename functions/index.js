const functions = require("firebase-functions/v1");
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const fs = require('fs');
const os = require('os');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with service account
const serviceAccount = require('./storycraft-71f24-firebase-adminsdk-fbsvc-52ccf36b6b.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Set environment variables from Firebase config
if (functions.config().anthropic) {
  process.env.ANTHROPIC_API_KEY = functions.config().anthropic.api_key;
}

if (functions.config().fal) {
  process.env.FAL_API_KEY = functions.config().fal.api_key;
}

// Import your story and image generators
const { generateStory, continueStory } = require('./storyGenerator');
const { generateImage } = require('./imageGenerator');

const app = express();

// In-memory storage for stories (in a real app, use Firestore)
const stories = {};

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Create uploads directory in the temp folder for Firebase Functions
const createUploadsDir = () => {
  const tempDir = path.join(os.tmpdir(), 'uploads');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

const uploadsDir = createUploadsDir();

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDir));

// API endpoint to create a new story
app.post('/stories', async (req, res) => {
  try {
    const { childName, childAge, childInterest } = req.body;
    
    if (!childName || !childAge || !childInterest) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const storyId = uuidv4();
    console.log(`Creating story with ID: ${storyId} for child: ${childName}, age: ${childAge}, interest: ${childInterest}`);
    
    // Generate initial story
    const storyData = await generateStory(childName, childAge, childInterest);

    console.log(`Story generated for ID: ${storyId}, title: ${storyData.title}, pages: ${storyData.pages.length}`);
    
    // Store the story without images initially
    stories[storyId] = storyData;
    
    // Send the initial response with the storyId
    res.status(201).json({ storyId });
    
    // Generate images for each page in the background
    (async () => {
      console.log(`Starting background image generation for story: ${storyId}`);
      for (let i = 0; i < storyData.pages.length; i++) {
        try {
          console.log(`Generating image for page ${i+1}/${storyData.pages.length} of story: ${storyId}`);
          const imageUrl = await generateImage(storyData.pages[i].content, childName);
          console.log(`Generated image for page ${i+1}/${storyData.pages.length} of story: ${storyId}, URL: ${imageUrl}`);
          
          // Update the story with the new image URL
          stories[storyId].pages[i].imageUrl = imageUrl;
        } catch (imageError) {
          console.error(`Error generating image for page ${i+1}/${storyData.pages.length} of story: ${storyId}:`, imageError);
          
          // Use a generic placeholder
          const fallbackUrl = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
          console.log(`Using fallback placeholder for page ${i+1}/${storyData.pages.length} of story: ${storyId}: ${fallbackUrl}`);
          stories[storyId].pages[i].imageUrl = fallbackUrl;
        }
      }
      console.log(`Completed background image generation for all pages of story: ${storyId}`);
    })();
    
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// API endpoint to get a story
app.get('/stories/:storyId', (req, res) => {
  const { storyId } = req.params;
  const story = stories[storyId];
  
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }
  
  res.json(story);
});

// API endpoint to continue a story based on selected option
app.post('/stories/:storyId/continue', async (req, res) => {
  try {
    const { storyId } = req.params;
    const { selectedOption, currentPage } = req.body;
    
    console.log(`Continuing story ${storyId}, current page: ${currentPage}, selected option: ${selectedOption}`);
    
    const story = stories[storyId];
    if (!story) {
      console.error(`Story not found: ${storyId}`);
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Continue the story based on the selected option
    console.log(`Generating continuation for story: ${storyId}`);
    const updatedStory = await continueStory(
      story, 
      currentPage, 
      selectedOption
    );
    
    console.log(`Story continued: ${storyId}, new total pages: ${updatedStory.pages.length}, added ${updatedStory.pages.length - story.pages.length} new pages`);
    
    // Update the story in storage without images first
    stories[storyId] = updatedStory;
    
    // Send the initial response with the updated story
    res.json(updatedStory);
    
    // Generate images for new pages in the background
    (async () => {
      const startIndex = story.pages.length;
      console.log(`Starting background image generation for ${updatedStory.pages.length - startIndex} new pages of story: ${storyId}`);
      
      for (let i = startIndex; i < updatedStory.pages.length; i++) {
        try {
          console.log(`Generating image for new page ${i+1}/${updatedStory.pages.length} of story: ${storyId}`);
          const imageUrl = await generateImage(updatedStory.pages[i].content, story.childName);
          console.log(`Generated image for new page ${i+1}/${updatedStory.pages.length} of story: ${storyId}, URL: ${imageUrl}`);
          
          // Update the story with the new image URL
          stories[storyId].pages[i].imageUrl = imageUrl;
        } catch (imageError) {
          console.error(`Error generating image for new page ${i+1}/${updatedStory.pages.length} of story: ${storyId}:`, imageError);
          
          // Use a generic placeholder
          const fallbackUrl = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
          console.log(`Using fallback placeholder for new page ${i+1}/${updatedStory.pages.length} of story: ${storyId}: ${fallbackUrl}`);
          stories[storyId].pages[i].imageUrl = fallbackUrl;
        }
      }
      console.log(`Completed background image generation for all new pages of story: ${storyId}`);
    })();
    
  } catch (error) {
    console.error('Error continuing story:', error);
    res.status(500).json({ error: 'Failed to continue story' });
  }
});

// Add a simple test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test endpoint working' });
});

// Export the API as a Firebase Function
exports.api = functions.https.onRequest((req, res) => {
  // Remove /api prefix if it exists
  if (req.path.startsWith('/api')) {
    req.url = req.url.replace('/api', '');
  }
  
  return app(req, res);
}); 