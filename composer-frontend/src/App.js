import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import TimelinePage from './pages/TimelinePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MyContributionsPage from './pages/MyContributionsPage';
import GamificationPage from './pages/GamificationPage';
import Footer from './components/Footer'; // Importar el Footer

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
        <nav className="p-4 bg-gray-800 text-white shadow-md">
          <ul className="flex justify-center space-x-6">
            <li>
              <Link to="/" className="hover:text-purple-300 transition duration-300">Línea de Tiempo</Link>
            </li>
            <li>
              <Link to="/gamification" className="hover:text-purple-300 transition duration-300">Ranking</Link>
            </li>
            <li>
              <Link to="/my-contributions" className="hover:text-purple-300 transition duration-300">Mis Aportes</Link>
            </li>
            <li>
              {isAdmin ? (
                <Link to="/admin/dashboard" className="hover:text-purple-300 transition duration-300">Admin Dashboard</Link>
              ) : (
                <Link to="/admin/login" className="hover:text-purple-300 transition duration-300">Admin</Link>
              )}
            </li>
             {isAdmin && (
              <li>
                <button onClick={handleLogout} className="hover:text-purple-300 transition duration-300 bg-transparent border-none text-white cursor-pointer">
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<TimelinePage />} />
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
