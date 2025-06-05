```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StoryCreator.css'; // Assuming you have a separate CSS file for styles

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
    const handleScroll = () => {
      const scrollDepth = Math.round(window.scrollY / document.body.scrollHeight * 100);
      console.log('Scroll Depth:', scrollDepth);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const trackInteraction = (event) => {
    console.log(`${event.target.name} interaction tracked`);
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
            onFocus={trackInteraction}
            required
            placeholder="Enter your child's name"
            aria-label="Enter child's name"
            className="input-field"
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
            onFocus={trackInteraction}
            required
            min="1"
            max="12"
            placeholder="Enter your child's age"
            aria-label="Enter child's age"
            className="input-field"
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
            onFocus={trackInteraction}
            required
            placeholder="e.g., dinosaurs, space, unicorns, soccer"
            aria-label="Enter child's interest"
            className="input-field"
          />
        </div>
        
        <button type="submit" disabled={loading} className="submit-button">
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
  background-color: #f4f7f8;
  color: #333;
  margin: 0;
  padding: 20px;
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #4a90e2;
  text-align: center;
}

p {
  text-align: center;
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

.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: #4a90e2;
  outline: none;
}

.submit-button {
  width: 100%;
  padding: 10px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.submit-button:hover:not(:disabled) {
  background-color: #357ABD;
}

.error-message {
  color: red;
  margin-bottom: 15px;
}
```