import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function StoryViewer() {
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [continuingStory, setContinuingStory] = useState(false);
  const [imageLoading, setImageLoading] = useState({});

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  useEffect(() => {
    if (!story) return;
    
    const hasMissingImages = story.pages.some(page => !page.imageUrl);
    
    if (hasMissingImages) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/stories/${storyId}`);
          if (!response.ok) throw new Error('Failed to fetch story updates');
          
          const updatedStory = await response.json();
          setStory(updatedStory);
          
          if (!updatedStory.pages.some(page => !page.imageUrl)) {
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error('Error polling for updates:', err);
        }
      }, 2000);
      
      return () => clearInterval(pollInterval);
    }
  }, [story, storyId]);

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
    if (!story) return;
    
    let targetPage = currentPage;
    
    if (direction === 'next' && currentPage < story.pages.length - 1) {
      targetPage = currentPage + 1;
    } else if (direction === 'prev' && currentPage > 0) {
      targetPage = currentPage - 1;
    } else {
      return; // No valid navigation
    }
    
    // Only navigate if the target page has an image
    if (story.pages[targetPage].imageUrl) {
      setCurrentPage(targetPage);
    }
  };

  // Check if the next page has an image loaded
  const isNextPageReady = () => {
    if (!story) return false;
    if (currentPage >= story.pages.length - 1) return false;
    if (story.pages[currentPage].options) return false;
    
    return !!story.pages[currentPage + 1].imageUrl;
  };

  // Check if the previous page has an image loaded
  const isPrevPageReady = () => {
    if (!story) return false;
    if (currentPage <= 0) return false;
    
    return !!story.pages[currentPage - 1].imageUrl;
  };

  // Handle image load events
  const handleImageLoad = (pageIndex) => {
    setImageLoading(prev => ({
      ...prev,
      [pageIndex]: false
    }));
  };

  const handleImageError = (pageIndex) => {
    setImageLoading(prev => ({
      ...prev,
      [pageIndex]: false
    }));
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
  const isCurrentImageLoading = !currentPageData.imageUrl;

  return (
    <div className="story-container">
      <h2>{story.title}</h2>
      
      <div className="story-page">
        {isCurrentImageLoading ? (
          <div className="image-loading-placeholder">
            <div className="loading-spinner"></div>
            <p>Creating your illustration...</p>
          </div>
        ) : (
          <img 
            src={currentPageData.imageUrl} 
            alt={`Illustration for page ${currentPage + 1}`}
            className="story-image"
            onLoad={() => handleImageLoad(currentPage)}
            onError={() => handleImageError(currentPage)}
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
        
        <div className="page-navigation">
          <button 
            onClick={() => navigatePage('prev')} 
            disabled={!isPrevPageReady()}
            className={!isPrevPageReady() && currentPage > 0 ? "loading-button" : ""}
          >
            {!isPrevPageReady() && currentPage > 0 ? (
              <>
                <span className="button-spinner"></span>
                Loading Previous
              </>
            ) : (
              "Previous Page"
            )}
          </button>
          <span>Page {currentPage + 1} of {story.pages.length}</span>
          <button 
            onClick={() => navigatePage('next')} 
            disabled={!isNextPageReady()}
            className={!isNextPageReady() && currentPage < story.pages.length - 1 && !currentPageData.options ? "loading-button" : ""}
          >
            {!isNextPageReady() && currentPage < story.pages.length - 1 && !currentPageData.options ? (
              <>
                <span className="button-spinner"></span>
                Loading Next
              </>
            ) : (
              "Next Page"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StoryViewer; 