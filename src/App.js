import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StoryCreator from './components/StoryCreator';
import StoryViewer from './components/StoryViewer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Adventure Tales: Your Child's Personalized Story</h1>
        </header>
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