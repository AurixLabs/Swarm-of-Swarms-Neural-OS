
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import DeveloperPage from './pages/DeveloperPage';

function App() {
  console.log('🚀 Main: Starting CMA Neural OS...');
  
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/developer" element={<DeveloperPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
