// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ConnectSocials from './pages/instgram';

function Home() {
  const navigate = useNavigate();

  const handleInstagramConnect = () => {
    navigate('/instagram');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <h1>OAuth Demo</h1>
      <button onClick={handleInstagramConnect}>
        Connect Instagram
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/instagram' element={<ConnectSocials />} /> 
      </Routes>
    </Router>
  );
}

export default App;

