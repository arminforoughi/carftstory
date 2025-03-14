const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { fal } = require('@fal-ai/client');

// Configure fal client with proper authentication
fal.config({
  // The API key should be passed as credentials
  credentials: '2c68e9ca-a327-4723-9f6e-a8b82b3b1b0d:7813205d9beb0391d159ce22a593bc3e'
});

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create a placeholder image directory
const placeholderDir = path.join(__dirname, 'client/public/images');
if (!fs.existsSync(placeholderDir)) {
  fs.mkdirSync(placeholderDir, { recursive: true });
}

async function generateImage(storyText, childName) {
  try {
    // For development/testing, return a placeholder image
    if (process.env.USE_PLACEHOLDER_IMAGES === 'true') {
      console.log('Using placeholder image');
      return '/images/placeholder.jpg';
    }
    
    // Create a prompt for the image generation
    const prompt = `
      Create a child-friendly cartoon illustration for a children's story
      The scene is: ${storyText.substring(0, 200)}...
      Style: Colorful, whimsical cartoon style suitable for children's books.

    `;

    // console.log('Generating image with prompt:', prompt);

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
    
    // Get the image URL from the result
    const imageUrl = result.data.images[0].url;
    
    // Download the image
    const response = await fetch(imageUrl);
    const imageBuffer = await response.arrayBuffer();
    
    // Save the image to disk
    const imageId = uuidv4();
    const imagePath = path.join(uploadsDir, `${imageId}.jpg`);
    fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
    
    console.log('Image saved to:', imagePath);

    // Return the URL to access the image
    return `/uploads/${imageId}.jpg`;
  } catch (error) {
    console.error('Error generating image:', error);
    // Return a placeholder image URL in case of error
    return '/images/placeholder.jpg';
  }
}

module.exports = {
  generateImage
}; 