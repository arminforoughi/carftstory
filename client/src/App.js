import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import StoryCreator from './components/StoryCreator';
import StoryViewer from './components/StoryViewer';
import './App.css';

// Create a component that conditionally renders the home image
function HomeImage() {
  const location = useLocation();
  // Only show the image on the home page
  if (location.pathname === '/') {
    return (
      <img 
        src="https://storage.googleapis.com/uxpilot-auth.appspot.com/4796b7851d-08fcfd4502f1ae248dbd.png" 
        alt="Story Craft Home" 
        className="home-image" 
      />
    );
  }
  return null;
}

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 100 }}>
          <h1 className="logo">Story Craft</h1>
        </header>
        
        <HomeImage />
        
        <main>
          <Routes>
            <Route path="/" element={<StoryCreator />} />
            <Route path="/story/:storyId" element={<StoryViewer />} />
          </Routes>
        </main>
        <footer>
          <p>Created with ❤️ for young adventurers</p>
        </footer>
      </div>
    </Router>
  );
}

export default App; 