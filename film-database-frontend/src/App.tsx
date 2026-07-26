import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import './styles/App.css';
import HomePage from './components/HomePage';
import MovieDetailsPage from './components/MovieDetailsPage';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import AdminUsers from './components/AdminUsers';

interface JwtPayload {
  role: string;
}

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUserRole(decoded.role);
      } catch (err) {
        console.error('Failed to decode token', err);
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
    setAuthLoaded(true);
  }, [isLoggedIn]);

  return (
    <Router>
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        userRole={userRole}
      />
      <Routes>
        <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>} />
        <Route path="/movie/:id" element={<MovieDetailsPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute
              isLoggedIn={isLoggedIn}
              authLoaded={authLoaded}
              userRole={userRole}
              unauthorizedPath="/unauthorized"
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
};

export default App;
