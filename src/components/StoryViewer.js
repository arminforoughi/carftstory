import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function StoryViewer() {
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [continuingStory, setContinuingStory] = useState(false);

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch story');
      }
      const data = await response.json();
      setStory(data);
    } catch (err) {
      setError(err.message || 'Failed to load the story');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (optionIndex) => {
    if (!story || !story.pages[currentPage].options) return;
    
    setContinuingStory(true);
    
    try {
      const response = await fetch(`/api/stories/${storyId}/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedOption: optionIndex,
          currentPage: currentPage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to continue story');
      }

      const data = await response.json();
      setStory(data);
      setCurrentPage(currentPage + 1);
    } catch (err) {
      setError(err.message || 'Failed to continue the story');
    } finally {
      setContinuingStory(false);
    }
  };

  const navigatePage = (direction) => {
    if (direction === 'next' && currentPage < story.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Creating your magical story...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!story) {
    return <div>Story not found</div>;
  }

  const currentPageData = story.pages[currentPage];

  return (
    <div className="story-container">
      <h2>{story.title}</h2>
      
      <div className="page-navigation">
        <button 
          onClick={() => navigatePage('prev')} 
          disabled={currentPage === 0}
        >
          Previous Page
        </button>
        <span>Page {currentPage + 1} of {story.pages.length}</span>
        <button 
          onClick={() => navigatePage('next')} 
          disabled={currentPage === story.pages.length - 1 || currentPageData.options}
        >
          Next Page
        </button>
      </div>
      
      <div className="story-page">
        {currentPageData.imageUrl && (
          <img 
            src={currentPageData.imageUrl} 
            alt={`Illustration for page ${currentPage + 1}`}
            className="story-image"
          />
        )}
        
        <div className="story-text">
          {currentPageData.content}
        </div>
        
        {currentPageData.options && (
          <div className="story-options">
            <h3>What happens next?</h3>
            {continuingStory ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Continuing the adventure...</p>
              </div>
            ) : (
              currentPageData.options.map((option, index) => (
                <button
                  key={index}
                  className="option-button"
                  onClick={() => handleOptionSelect(index)}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StoryViewer; 