
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import DeveloperPage from './pages/DeveloperPage';
import QuickStartPage from './pages/docs/QuickStartPage';
import ArchitecturePage from './pages/docs/ArchitecturePage';
import ApiPage from './pages/docs/ApiPage';
import CommunityPage from './pages/CommunityPage';

function App() {
  console.log('🚀 Main: Starting CMA Neural OS...');
  
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/developer" element={<DeveloperPage />} />
          <Route path="/docs/quickstart" element={<QuickStartPage />} />
          <Route path="/docs/architecture" element={<ArchitecturePage />} />
          <Route path="/docs/api" element={<ApiPage />} />
          <Route path="/community" element={<CommunityPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
