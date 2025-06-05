```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackScrollDepth, trackButtonClick, trackTimeSpent, trackFormInteraction } from './analytics';

function StoryCreator() {
  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    childInterest: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startTime] = useState(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => trackScrollDepth();
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleUnload = () => trackTimeSpent(Date.now() - startTime);
    window.addEventListener('beforeunload', handleUnload);

    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [startTime]);

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

  return (
    <div className="form-container">
      <h2>Create a Personalized Adventure</h2>
      <p>Let's craft a magical story starring your child!</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} aria-live="polite">
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
            aria-required="true"
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
            aria-required="true"
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
            aria-required="true"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          onClick={() => trackButtonClick('Create Adventure Button')}
          className={loading ? 'loading' : ''}
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
body {
  font-family: 'Arial', sans-serif;
  background-color: #f4f4f4;
  color: #333;
  margin: 0;
  padding: 0;
}

.form-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.form-container:hover {
  transform: scale(1.02);
}

h2 {
  color: #4A90E2;
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
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #4A90E2;
  outline: none;
}

button {
  padding: 10px 15px;
  background-color: #4A90E2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #357ABD;
}

.loading {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-bottom: 15px;
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive Design */
@media (max-width: 600px) {
  .form-container {
    padding: 15px;
  }
}
```