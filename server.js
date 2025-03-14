const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { generateStory, continueStory } = require('./storyGenerator');
const { generateImage } = require('./imageGenerator');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory storage for stories (in a real app, use a database)
const stories = {};

// Create a placeholder image if it doesn't exist
const placeholderPath = path.join(__dirname, 'client/public/images/placeholder.jpg');
if (!fs.existsSync(path.dirname(placeholderPath))) {
  fs.mkdirSync(path.dirname(placeholderPath), { recursive: true });
}

// Create a very simple placeholder image if it doesn't exist
if (!fs.existsSync(placeholderPath)) {
  // This is a minimal valid JPG file
  const minimalJpg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
    0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00,
    0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01,
    0x01, 0x00, 0x00, 0x3f, 0x00, 0x37, 0xff, 0xd9
  ]);
  
  fs.writeFileSync(placeholderPath, minimalJpg);
  console.log('Created placeholder image at', placeholderPath);
}

app.use(express.json());

// Add this line to serve the uploads directory as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'client/public/images')));

// Make sure this is correctly set up for development
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
} else {
  // For development, add a simple response for the root route
  app.get('/', (req, res) => {
    res.send('API is running. Please start the React development server with npm run client');
  });
}

// Add this route before your catch-all handler
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Adventure Tales</title>
        <style>
          body { font-family: 'Comic Sans MS', sans-serif; text-align: center; margin: 50px; }
          h1 { color: #70c1b3; }
          .form { max-width: 500px; margin: 0 auto; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
          input, button { width: 100%; padding: 10px; margin: 10px 0; box-sizing: border-box; }
          button { background: #ff9a8b; color: white; border: none; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>Adventure Tales: Your Child's Personalized Story</h1>
        <div class="form">
          <h2>Create a Personalized Adventure</h2>
          <form id="storyForm">
            <input type="text" id="childName" placeholder="Child's Name" required>
            <input type="number" id="childAge" placeholder="Child's Age" min="1" max="12" required>
            <input type="text" id="childInterest" placeholder="Something They Like" required>
            <button type="submit">Create Adventure!</button>
          </form>
          <div id="result"></div>
        </div>
        <script>
          document.getElementById('storyForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const result = document.getElementById('result');
            result.innerHTML = 'Creating story...';
            
            try {
              const response = await fetch('/api/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  childName: document.getElementById('childName').value,
                  childAge: document.getElementById('childAge').value,
                  childInterest: document.getElementById('childInterest').value
                })
              });
              
              if (!response.ok) throw new Error('Failed to create story');
              
              const data = await response.json();
              result.innerHTML = \`<p>Story created! ID: \${data.storyId}</p><a href="/api/stories/\${data.storyId}">View JSON</a>\`;
            } catch (err) {
              result.innerHTML = \`Error: \${err.message}\`;
            }
          });
        </script>
      </body>
    </html>
  `);
});

// API endpoint to create a new story
app.post('/api/stories', async (req, res) => {
  try {
    const { childName, childAge, childInterest } = req.body;
    
    if (!childName || !childAge || !childInterest) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const storyId = uuidv4();
    
    // Generate initial story
    const storyData = await generateStory(childName, childAge, childInterest);

    console.log('Story data:', storyData);
    // Store the story without images initially
    stories[storyId] = storyData;
    
    // Send the initial response with the storyId
    res.status(201).json({ storyId });
    
    // Generate images for each page in the background
    (async () => {
      for (let i = 0; i < storyData.pages.length; i++) {
        try {
          const imageUrl = await generateImage(storyData.pages[i].content, childName);
          console.log(`Generated image for page ${i+1}:`, imageUrl);
          
          // Update the story with the new image URL
          stories[storyId].pages[i].imageUrl = imageUrl;
        } catch (imageError) {
          console.error(`Error generating image for page ${i+1}:`, imageError);
          // Use placeholder image on error
          stories[storyId].pages[i].imageUrl = '/images/placeholder.jpg';
        }
      }
    })();
    
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// API endpoint to get a story
app.get('/api/stories/:storyId', (req, res) => {
  const { storyId } = req.params;
  const story = stories[storyId];
  
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }
  
  res.json(story);
});

// API endpoint to continue a story based on selected option
app.post('/api/stories/:storyId/continue', async (req, res) => {
  try {
    const { storyId } = req.params;
    const { selectedOption, currentPage } = req.body;
    
    const story = stories[storyId];
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Continue the story based on the selected option
    const updatedStory = await continueStory(
      story, 
      currentPage, 
      selectedOption
    );
    
    // Update the story in storage without images first
    stories[storyId] = updatedStory;
    
    // Send the initial response with the updated story
    res.json(updatedStory);
    
    // Generate images for new pages in the background
    (async () => {
      const startIndex = story.pages.length;
      for (let i = startIndex; i < updatedStory.pages.length; i++) {
        try {
          const imageUrl = await generateImage(updatedStory.pages[i].content, story.childName);
          console.log(`Generated image for new page ${i+1}:`, imageUrl);
          
          // Update the story with the new image URL
          stories[storyId].pages[i].imageUrl = imageUrl;
        } catch (imageError) {
          console.error(`Error generating image for new page ${i+1}:`, imageError);
          // Use placeholder image on error
          stories[storyId].pages[i].imageUrl = '/images/placeholder.jpg';
        }
      }
    })();
    
  } catch (error) {
    console.error('Error continuing story:', error);
    res.status(500).json({ error: 'Failed to continue story' });
  }
});

// Catch-all handler for client-side routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 