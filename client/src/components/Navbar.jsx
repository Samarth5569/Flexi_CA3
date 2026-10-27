import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Salad, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{
      backgroundColor: 'rgba(251, 249, 245, 0.92)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none'
        }}>
          <div style={{
            backgroundColor: 'var(--primary-faint)',
            padding: '8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-green)'
          }}>
            <Salad size={26} />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.45rem',
              fontWeight: 700,
              color: 'var(--primary-deep)',
              letterSpacing: '-0.02em',
              display: 'block',
              lineHeight: 1.1
            }}>MealMate</span>
            <span style={{
              fontSize: '0.68rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--accent-terracotta)',
              fontWeight: 700
            }}>Plan Better. Eat Smarter.</span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                <LayoutDashboard size={17} />
                <span>Open Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.88rem' }}
                title="Log Out"
              >
                <LogOut size={16} />
                <span className="desktop-only">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.9rem' }}
              >
                <LogIn size={17} />
                <span>Log In</span>
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.9rem' }}
              >
                <UserPlus size={17} />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
