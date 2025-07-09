import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import TimelinePage from './pages/TimelinePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MyContributionsPage from './pages/MyContributionsPage';
import GamificationPage from './pages/GamificationPage';
import AboutPage from './pages/AboutPage'; // Importar AboutPage
import Footer from './components/Footer'; // Importar el Footer
import Header from './components/Header'; // Importar el Header

import { Toaster } from 'react-hot-toast';
import AddComposerForm from './components/AddComposerForm';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAdmin(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
  };

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col min-h-screen bg-slate-900">
        <Header isAdmin={isAdmin} handleLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<TimelinePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contribute" element={<AddComposerForm />} />
            <Route path="/admin/login" element={<AdminLoginPage onLogin={handleLogin} />} />
            <Route 
              path="/admin/dashboard" 
              element={isAdmin ? <AdminDashboardPage handleLogout={handleLogout} /> : <Navigate to="/admin/login" />} 
            />
            <Route path="/my-contributions" element={<MyContributionsPage />} />
            <Route path="/gamification" element={<GamificationPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
