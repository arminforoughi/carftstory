```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StoryCreator.css'; // Assume this CSS file contains styles for modern UI

function StoryCreator() {
  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    childInterest: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const startTime = useRef(Date.now());

  useEffect(() => {
    const handleScroll = () => {
      const scrollDepth = window.scrollY + window.innerHeight;
      const totalHeight = document.body.scrollHeight;
      if (scrollDepth >= totalHeight) {
        trackScrollDepth();
      }
    };

    const trackScrollDepth = () => {
      // Replace with actual tracking logic
      console.log('User reached the bottom of the page');
      window.removeEventListener('scroll', handleScroll);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
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

  useEffect(() => {
    const trackTimeSpent = () => {
      const timeSpent = (Date.now() - startTime.current) / 1000; // seconds
      console.log(`User spent ${timeSpent} seconds on the page`);
    };

    return trackTimeSpent;
  }, []);

  const handleButtonClick = () => {
    // Replace with actual tracking logic
    console.log('Create Adventure button clicked');
  };

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
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          onClick={handleButtonClick}
          className={`submit-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Creating Story...' : 'Create Adventure!'}
        </button>
      </form>
    </div>
  );
}

export default StoryCreator;
``` 

```css
/* StoryCreator.css */
body {
  font-family: 'Arial', sans-serif;
  background-color: #f0f4f8;
  color: #333;
  margin: 0;
  padding: 0;
}

.form-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
}

.form-container:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

h2 {
  font-size: 1.8em;
  margin-bottom: 10px;
}

p {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  transition: border 0.3s;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

.submit-button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s, transform 0.2s;
}

.submit-button:hover {
  background-color: #0056b3;
}

.submit-button.loading {
  background-color: #6c757d;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-bottom: 20px;
}
```