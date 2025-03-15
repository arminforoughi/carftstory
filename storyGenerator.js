const { Anthropic } = require('@anthropic-ai/sdk');

// Initialize Anthropic client (only if API key is valid)
let anthropic = null;
try {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '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',
  });
  console.log('Anthropic client initialized successfully');
} catch (error) {
  console.warn('Failed to initialize Anthropic client:', error.message);
}
// tests
// Helper function to create a fallback story
function createFallbackStory(childName, childAge, childInterest) {
  console.log('Creating fallback story');
  return {
    title: `${childName}'s Adventure with ${childInterest}`,
    childName: childName,
    childAge: childAge,
    childInterest: childInterest,
    pages: [
      {
        content: `Once upon a time, there was a ${childAge}-year-old named ${childName} who loved ${childInterest} more than anything in the world.`,
        imagePrompt: `A child named ${childName} excited about ${childInterest}`
      },
      {
        content: `One day, ${childName} discovered a magical world where ${childInterest} came to life!`,
        imagePrompt: `${childName} discovering a magical world of ${childInterest}`
      },
      {
        content: `${childName} had to solve a big problem using their knowledge of ${childInterest}.`,
        imagePrompt: `${childName} thinking hard about a problem`
      },
      {
        content: `With creativity and courage, ${childName} found the perfect solution!`,
        imagePrompt: `${childName} looking triumphant after solving a problem`
      },
      {
        content: `${childName} learned that with imagination and perseverance, any challenge can be overcome.`,
        options: [
          `${childName} decides to share their discovery with friends`,
          `${childName} explores more of the magical world`,
          `${childName} uses their new knowledge to help others`
        ],
        imagePrompt: `${childName} looking proud and happy`
      }
    ]
  };
}

async function generateStory(childName, childAge, childInterest) {
  try {
    // Use fallback story if API is disabled or in development mode
    if (!anthropic) {
      console.log('Using fallback story generation');
      return createFallbackStory(childName, childAge, childInterest);
    }

    const prompt = `
      Create first 5 pages of a children's story for a ${childAge}-year-old named ${childName} who loves ${childInterest}.
      
      The story should:
      - Feature ${childName} as the main character
      - the story should have a theme and context with alot of details put the child in a fun and exciting adventure
      - introduce conflicts and problems
      - each page should be 3-5 sentences depending on age of child
      - End with 2-3 options for what could happen next (this could be direction of the story or answer to a puzzle or problem)
      
      
      Format the response as a JSON object with this structure:
      {
        "title": "Story title",
        "childName": "${childName}",
        "childAge": ${childAge},
        "childInterest": "${childInterest}",
        "pages": [
          {
            "content": "Page 1 text...",
            "imagePrompt": "detailed prompt for an image for the first page"
          },
          // more pages...
          {
            "content": "Final page text...",
            "options": [ (options to what to do next)
  
            ],
            "imagePrompt": "detailed prompt for an image for the final page"
          }
        ]
      }
    `;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropic.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const responseData = await response.json();
    console.log('prompt:', prompt);
    console.log('Story generated:', responseData.content[0].text);

    // Extract and parse the JSON from the response
    const jsonMatch = responseData.content[0].text.match(/```json\n([\s\S]*?)\n```/) || 
                      responseData.content[0].text.match(/{[\s\S]*}/);
                      
    if (!jsonMatch) {
      console.error('Failed to parse JSON from Claude response:', responseData.content[0].text);
      return createFallbackStory(childName, childAge, childInterest);
    }
    
    const storyData = JSON.parse(jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1]);
    return storyData;
  } catch (error) {
    console.error('Error generating story:', error);
    return createFallbackStory(childName, childAge, childInterest);
  }
}

async function continueStory(story, currentPage, selectedOption) {
  try {
    // Use fallback continuation if API is disabled or in development mode
    if (!anthropic) {
      console.log('Using fallback story continuation');
      
      const currentPageData = story.pages[currentPage];
      const selectedChoice = currentPageData.options[selectedOption];
      
      // Create fallback continuation pages
      const newPages = [
        {
          content: `${story.childName} decided to ${selectedChoice.toLowerCase()}. It was an exciting new chapter in the adventure!`,
          imagePrompt: `${story.childName} starting a new adventure`
        },
        {
          content: `As ${story.childName} continued exploring, they discovered even more amazing things about ${story.childInterest}.`,
          imagePrompt: `${story.childName} discovering something new`
        },
        {
          content: `The journey wasn't over yet. ${story.childName} had more choices to make and adventures to have!`,
          options: [
            `${story.childName} decides to go home and tell everyone about the adventure`,
            `${story.childName} finds a mysterious map leading to a new place`,
            `${story.childName} meets a new friend who needs help`
          ],
          imagePrompt: `${story.childName} looking at different paths ahead`
        }
      ];
      
      // Remove options from the current page
      delete story.pages[currentPage].options;
      
      // Add new pages to the story
      return {
        ...story,
        pages: [
          ...story.pages,
          ...newPages
        ]
      };
    }

    const currentPageData = story.pages[currentPage];
    const selectedChoice = currentPageData.options[selectedOption];
    
    const prompt = `
      Continue this children's story for a ${story.childAge}-year-old named ${story.childName} who loves ${story.childInterest}.
      
      Current story so far:
      Title: ${story.title}
      
      ${story.pages.slice(0, currentPage + 1).map((page, index) => 
        `Page ${index + 1}: ${page.content}`
      ).join('\n\n')}
      
      The reader selected this option for what happens next:
      "${selectedChoice}"
      
      Generate 3-4 new pages that continue the story based on this choice. The final new page should present 2-3 new options for what could happen next or if they encounter a problem or puzzle how they can solve it.
      
      Format the response as a JSON object with this structure:
      {
        "newPages": [
          {
            "content": "New page text...",
            "imagePrompt": "Description for generating an illustration"
          },
          // more pages...
          {
            "content": "Final new page text...",
            "options": [
              "Option 1 for what happens next",
              "Option 2 for what happens next",
              "Option 3 for what happens next"
            ],
            "imagePrompt": "Description for generating an illustration"
          }
        ]
      }
    `;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropic.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const responseData = await response.json();

    // Extract and parse the JSON from the response
    const jsonMatch = responseData.content[0].text.match(/```json\n([\s\S]*?)\n```/) || 
                      responseData.content[0].text.match(/{[\s\S]*}/);
                      
    if (!jsonMatch) {
      throw new Error('Failed to parse continuation JSON from Claude response');
    }
    
    const continuationData = JSON.parse(jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1]);
    
    // Remove options from the current page
    delete story.pages[currentPage].options;
    
    // Add new pages to the story
    const updatedStory = {
      ...story,
      pages: [
        ...story.pages,
        ...continuationData.newPages
      ]
    };
    
    return updatedStory;
  } catch (error) {
    console.error('Error continuing story:', error);
    
    // Create fallback continuation
    const currentPageData = story.pages[currentPage];
    const selectedChoice = currentPageData.options ? currentPageData.options[selectedOption] : "continue the adventure";
    
    // Create fallback continuation pages
    const newPages = [
      {
        content: `${story.childName} decided to ${selectedChoice.toLowerCase()}. It was an exciting new chapter in the adventure!`,
        imagePrompt: `${story.childName} starting a new adventure`
      },
      {
        content: `As ${story.childName} continued exploring, they discovered even more amazing things about ${story.childInterest}.`,
        imagePrompt: `${story.childName} discovering something new`
      },
      {
        content: `The journey wasn't over yet. ${story.childName} had more choices to make and adventures to have!`,
        options: [
          `${story.childName} decides to go home and tell everyone about the adventure`,
          `${story.childName} finds a mysterious map leading to a new place`,
          `${story.childName} meets a new friend who needs help`
        ],
        imagePrompt: `${story.childName} looking at different paths ahead`
      }
    ];
    
    // Remove options from the current page
    if (currentPageData.options) {
      delete story.pages[currentPage].options;
    }
    
    // Add new pages to the story
    return {
      ...story,
      pages: [
        ...story.pages,
        ...newPages
      ]
    };
  }
}

module.exports = {
  generateStory,
  continueStory
}; 