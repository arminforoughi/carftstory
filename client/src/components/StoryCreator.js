```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StoryCreator.css'; // Import CSS for styling
import { trackScrollDepth, trackButtonClick, trackTimeSpent, trackFormInteraction, trackVideoPlay, trackLinkClick } from './analytics';

function StoryCreator() {
  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    childInterest: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackTimeSpent(timeSpent);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    trackFormInteraction(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create story');
      }

      const data = await response.json();
      navigate(`/story/${data.storyId}`);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      trackScrollDepth(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="form-container">
      <h2>Create a Personalized Adventure</h2>
      <p>Let's craft a magical story starring your child!</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="childName">Child's Name:</label>
          <input
            type="text"
            id="childName"
            name="childName"
            value={formData.childName}
            onChange={handleChange}
            required
            placeholder="Enter your child's name"
            aria-label="Child's Name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="childAge">Child's Age:</label>
          <input
            type="number"
            id="childAge"
            name="childAge"
            value={formData.childAge}
            onChange={handleChange}
            required
            min="1"
            max="12"
            placeholder="Enter your child's age"
            aria-label="Child's Age"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="childInterest">Something They Like:</label>
          <input
            type="text"
            id="childInterest"
            name="childInterest"
            value={formData.childInterest}
            onChange={handleChange}
            required
            placeholder="e.g., dinosaurs, space, unicorns, soccer"
            aria-label="Child's Interest"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          onClick={() => trackButtonClick('Create Adventure Button')}
          className="submit-button"
        >
          {loading ? 'Creating Story...' : 'Create Adventure!'}
        </button>
      </form>
      
      <footer>
        <p>© 2023 Story Creator. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default StoryCreator;
```

**StoryCreator.css**
```css
body {
  font-family: 'Arial', sans-serif;
  background-color: #f4f4f9;
  margin: 0;
  padding: 20px;
}

.form-container {
  max-width: 600px;
  margin: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: all 0.3s ease;
}

h2 {
  color: #4a4e69;
}

.error-message {
  color: #ff4d4d;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #22223b;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #4a4e69;
  outline: none;
}

.submit-button {
  background-color: #4a4e69;
  color: #fff;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #22223b;
}

footer {
  text-align: center;
  margin-top: 20px;
}
```