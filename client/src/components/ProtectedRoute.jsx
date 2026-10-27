import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Salad } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--primary-deep)',
          fontSize: '1.4rem',
          fontWeight: 700
        }}>
          <Salad size={32} color="var(--primary-green)" />
          <span>MealMate</span>
        </div>
        <div className="spinner spinner-dark" style={{ width: '32px', height: '32px' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verifying your secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
