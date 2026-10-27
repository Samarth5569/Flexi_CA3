import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Salad, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-app)' }}>
      {/* Sidebar for navigation */}
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        marginLeft: '260px'
      }} className="main-content-layout">
        {/* Mobile Header */}
        <header
          className="mobile-only"
          style={{
            height: '64px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                color: 'var(--primary-deep)',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Toggle navigation menu"
            >
              <Menu size={22} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Salad size={22} color="var(--primary-green)" />
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '1.2rem',
                color: 'var(--primary-deep)'
              }}>MealMate</span>
            </div>
          </div>

          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </header>

        {/* Page Container */}
        <main style={{
          flex: 1,
          padding: '30px 32px',
          maxWidth: '1360px',
          width: '100%',
          margin: '0 auto'
        }} className="page-padding">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .main-content-layout {
            margin-left: 0 !important;
          }
          .sidebar-desktop {
            transform: translateX(-100%) !important;
          }
          .sidebar-mobile-open {
            transform: translateX(0) !important;
          }
          .page-padding {
            padding: 20px 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
