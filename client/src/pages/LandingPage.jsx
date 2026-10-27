import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Utensils,
  CalendarCheck,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ChefHat,
  Clock,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        padding: '70px 0 80px',
        backgroundColor: 'var(--bg-app)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'center'
        }}>
          {/* Hero Left Content */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              backgroundColor: 'var(--primary-faint)',
              color: 'var(--primary-deep)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '20px'
            }}>
              <Sparkles size={16} color="var(--primary-green)" />
              <span>CA-3 Full Stack Web Development</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.4rem, 4.2vw, 3.8rem)',
              lineHeight: 1.15,
              marginBottom: '20px',
              letterSpacing: '-0.02em'
            }}>
              Plan Better. <br />
              <span style={{ color: 'var(--accent-terracotta)', fontStyle: 'italic' }}>
                Eat Smarter.
              </span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '520px'
            }}>
              MealMate is your all-in-one culinary companion. Store cherished recipes,
              map out nutritious weekly schedules, and maintain an organized grocery list
              with real-time database persistence.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                  <span>Go to My Dashboard</span>
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                    <span>Get Started Free</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn-secondary" style={{ padding: '14px 26px', fontSize: '1rem' }}>
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Visual Card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-light)',
              backgroundColor: '#FFFFFF',
              position: 'relative'
            }}>
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80"
                alt="Nutritious Salad Bowl"
                style={{
                  width: '100%',
                  height: '380px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <div style={{
                padding: '24px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span className="badge badge-green" style={{ marginBottom: '6px' }}>Mediterranean Fresh</span>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Warm Quinoa & Avocado Bowl</h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>20 mins prep • 2 servings</span>
                </div>
                <div style={{
                  backgroundColor: 'var(--primary-faint)',
                  color: 'var(--primary-green)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Heart size={22} fill="var(--primary-green)" />
                </div>
              </div>
            </div>

            {/* Floating Tag */}
            <div style={{
              position: 'absolute',
              top: '24px',
              left: '-20px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px solid var(--border-light)'
            }} className="desktop-only">
              <CalendarCheck size={22} color="var(--primary-green)" />
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Meal Plan Slot</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-deep)' }}>Tuesday Lunch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Modules */}
      <section style={{ padding: '80px 0', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 60px' }}>
            <span style={{
              color: 'var(--accent-terracotta)',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Core Architecture
            </span>
            <h2 style={{ fontSize: '2.3rem', marginTop: '8px', marginBottom: '14px' }}>
              Built for Effortless Meal Management
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
              MealMate integrates recipe curation, weekly meal scheduling, and grocery procurement
              into a unified, reactive interface.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '28px'
          }}>
            {/* Feature 1 */}
            <div className="card" style={{ padding: '32px' }}>
              <div style={{
                backgroundColor: 'var(--primary-faint)',
                color: 'var(--primary-green)',
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <ChefHat size={28} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '12px' }}>Personalized Recipes</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '18px' }}>
                Store your favorite homemade meals with structured ingredients, step-by-step
                instructions, preparation times, servings, difficulty ratings, and dietary categories.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                <li>✓ Dynamic ingredient management</li>
                <li>✓ Full CRUD with search & category filters</li>
                <li>✓ One-click favorite toggling</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="card" style={{ padding: '32px' }}>
              <div style={{
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent-terracotta)',
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <CalendarCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '12px' }}>Weekly Meal Planner</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '18px' }}>
                Visualize your nutrition for the entire week from Monday through Sunday.
                Assign recipes to Breakfast, Lunch, or Dinner slots with custom prep notes.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--accent-terracotta)', fontWeight: 600 }}>
                <li>✓ Weekly calendar navigation</li>
                <li>✓ Recipe ownership verification</li>
                <li>✓ Seamless reschedule & removal</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="card" style={{ padding: '32px' }}>
              <div style={{
                backgroundColor: 'var(--primary-faint)',
                color: 'var(--primary-green)',
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <ShoppingBag size={28} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '12px' }}>Smart Grocery Checklist</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '18px' }}>
                Keep track of pending grocery essentials organized by supermarket aisles.
                Check off items in real-time as you shop, with bulk cleanup capabilities.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                <li>✓ Aisle-based categorization</li>
                <li>✓ Instant purchased status toggling</li>
                <li>✓ Bulk removal with confirmation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: 'var(--primary-deep)',
        color: '#FFFFFF',
        padding: '48px 0 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px',
            paddingBottom: '32px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <div>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                fontWeight: 700,
                display: 'block'
              }}>MealMate</span>
              <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: '4px' }}>
                Plan Better. Eat Smarter. Full-Stack Web Development CA-3 Project.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem' }}>
              <Link to="/login" style={{ color: '#FFFFFF' }}>Sign In</Link>
              <Link to="/register" style={{ color: '#FFFFFF' }}>Register</Link>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            fontSize: '0.8rem',
            color: 'var(--text-light)'
          }}>
            <span>PRN: 25070521188 • Repository: 25070521188-CA-03</span>
            <span>Connected to MongoDB Server • Node.js Express REST API</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
