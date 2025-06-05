```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StoryCreator.css'; // Import a CSS file for styles

function StoryCreator() {
  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    childInterest: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // User interaction tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollDepth = Math.round((window.scrollY / document.documentElement.scrollHeight) * 100);
      console.log(`Scroll Depth: ${scrollDepth}%`);
    };

    const handleTimeSpent = () => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        console.log(`Time spent on page: ${(Date.now() - startTime) / 1000} seconds`);
      }, 1000);
      return () => clearInterval(interval);
    };

    window.addEventListener('scroll', handleScroll);
    const timer = handleTimeSpent();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      timer();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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

  return (
    <div className="form-container">
      <h2>Create a Personalized Adventure</h2>
      <p>Let's craft a magical story starring your child!</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="story-form">
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
        
        <button type="submit" disabled={loading} className={`submit-button ${loading ? 'loading' : ''}`}>
          {loading ? 'Creating Story...' : 'Create Adventure!'}
        </button>
      </form>
    </div>
  );
}

export default StoryCreator;
```

**CSS (StoryCreator.css)**
```css
body {
  font-family: 'Arial', sans-serif;
  background-color: #f0f4f8;
  margin: 0;
  padding: 0;
  color: #333;
}

.form-container {
  max-width: 600px;
  margin: auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

.form-container:hover {
  transform: scale(1.02);
}

h2 {
  color: #4a90e2;
}

.error-message {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.story-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #4a90e2;
  outline: none;
}

.submit-button {
  padding: 0.8rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button.loading {
  background-color: #3498db;
}

.submit-button:hover {
  background-color: #357ABD;
}
```