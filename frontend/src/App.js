// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ConnectSocials from './pages/instgram';

function Home() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <h1>OAuth Demo</h1>
      <button onClick={handleLogin}>
        Login with Google
      </button>
    </div>
  );
}

function OAuthSuccess() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    console.log("Received code from Google:", code);
  }, [location]);

  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <h1>Google Login Successful</h1>
      <p>Welcome 😊</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path='/instagram' element={<ConnectSocials />} /> 
      </Routes>
    </Router>
  );
}

export default App;

