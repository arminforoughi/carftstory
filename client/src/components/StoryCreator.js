```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StoryCreator() {
  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    childInterest: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [timeSpent, setTimeSpent] = useState(0);
  const [scrollDepth, setScrollDepth] = useState(0);
  let timer;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const totalScroll = documentHeight - windowHeight;
      setScrollDepth(Math.round((scrollTop / totalScroll) * 100));
    };

    const handleTimeSpent = () => {
      timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll);
    handleTimeSpent();

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
      console.log('Time spent on page:', timeSpent);
      console.log('Scroll depth:', scrollDepth);
    };
  }, [timeSpent, scrollDepth]);

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
        
        <button type="submit" disabled={loading} className={`submit-button ${loading ? 'loading' : ''}`}>
          {loading ? 'Creating Story...' : 'Create Adventure!'}
        </button>
      </form>

      <style jsx>{`
        .form-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.3s;
        }

        .form-container:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        h2 {
          color: #333;
          font-family: 'Arial', sans-serif;
        }

        .error-message {
          color: red;
        }

        .form-group {
          margin-bottom: 15px;
        }

        label {
          display: block;
          font-weight: bold;
          margin-bottom: 5px;
        }

        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          transition: border-color 0.3s;
        }

        input:focus {
          border-color: #007BFF;
          outline: none;
        }

        .submit-button {
          width: 100%;
          padding: 10px;
          background-color: #007BFF;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.3s;
        }

        .submit-button:hover {
          background-color: #0056b3;
          transform: translateY(-2px);
        }

        .submit-button.loading {
          background-color: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default StoryCreator;
```