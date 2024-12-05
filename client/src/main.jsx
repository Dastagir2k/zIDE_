import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* Pass `userid` as a route parameter */}
        
        <Route path="/" element={<App />}  />
      </Routes>
    </Router>
  </StrictMode>
);
