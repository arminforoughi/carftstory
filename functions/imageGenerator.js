const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { fal } = require('@fal-ai/client');
const admin = require('firebase-admin');

// Note: We don't initialize admin here, it's already initialized in index.js

// Configure fal client with proper authentication
fal.config({
  // The API key should be passed as credentials
  credentials: process.env.FAL_API_KEY || '2c68e9ca-a327-4723-9f6e-a8b82b3b1b0d:7813205d9beb0391d159ce22a593bc3e'
});

// Ensure the uploads directory exists in the temp directory for Firebase Functions
const uploadsDir = path.join(os.tmpdir(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function generateImage(storyText, childName) {
  try {
    // Default placeholder URL - a generic placeholder in case everything fails
    const defaultPlaceholderUrl = 'https://via.placeholder.com/800x600?text=Story+Image';
    
    // For development/testing, return a placeholder image
    if (process.env.USE_PLACEHOLDER_IMAGES === 'true') {
      console.log('Using placeholder image due to USE_PLACEHOLDER_IMAGES flag');
      return defaultPlaceholderUrl;
    }
    
    // Create a prompt for the image generation
    const prompt = `
      Create a child-friendly cartoon illustration for a children's story
      The scene is: ${storyText.substring(0, 200)}...
      Style: Colorful, whimsical cartoon style suitable for children's books.
    `;

    console.log('Generating image with prompt:', prompt);

    // Call Flux Schnell API using fal client
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: prompt,
        style: "cartoon",
        width: 800,
        height: 600
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log('Image generation completed, request ID:', result.requestId);
    
    // Check if the result has the expected structure
    if (!result || !result.data || !result.data.images || !Array.isArray(result.data.images) || result.data.images.length === 0) {
      console.error('Invalid response from FAL API:', JSON.stringify(result));
      return defaultPlaceholderUrl;
    }
    
    // Get the image URL from the result
    const imageUrl = result.data.images[0].url;
    
    if (!imageUrl) {
      console.error('No image URL in the response');
      return defaultPlaceholderUrl;
    }
    
    console.log('Using FAL generated image URL:', imageUrl);
    
    // Return the FAL image URL directly
    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    return 'https://via.placeholder.com/800x600?text=Story+Image';
  }
}

module.exports = {
  generateImage
}; 