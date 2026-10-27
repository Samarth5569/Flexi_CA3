import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Sparkles
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters long.');
      return;
    }

    try {
      setUpdating(true);
      await updateProfile(name.trim());
      setSuccessMsg('Your profile name was successfully updated in MongoDB!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const formattedJoinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Active Session';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.1rem' }}>User Profile & Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your personal credentials, examine account security, and review database persistence
        </p>
      </div>

      {successMsg && (
        <div className="alert-box alert-success">
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert-box alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Profile Card */}
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-green)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 800
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{user?.name}</h2>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                {user?.email}
              </span>
              <div style={{ marginTop: '6px' }}>
                <span className="badge badge-green">Verified Student Account</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdate}>
            {/* Full Name Edit */}
            <div className="form-group">
              <label className="form-label">
                <User size={15} /> Full Name
              </label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            {/* Readonly Email */}
            <div className="form-group">
              <label className="form-label">
                <Mail size={15} /> Registered Email Address
              </label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: 'var(--bg-muted)', cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Email addresses are immutable unique database identifiers.
              </span>
            </div>

            {/* Creation Date */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">
                <Calendar size={15} /> Member Since
              </label>
              <input
                type="text"
                className="form-input"
                value={formattedJoinDate}
                disabled
                style={{ backgroundColor: 'var(--bg-muted)', cursor: 'not-allowed' }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '11px' }}
              disabled={updating}
            >
              {updating ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                  <span>Saving Updates...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </form>
        </div>

        {/* Security & System Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--primary-green)" />
              Security & Credentials
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Bcrypt Password Hashing:</strong> 10-round salted hashing applied on the backend before storage.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>JWT Bearer Token:</strong> Authenticated requests use cryptographically signed tokens.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Strict User Isolation:</strong> Every database query strictly filters by authenticated User ID.</span>
              </li>
            </ul>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={20} color="var(--accent-terracotta)" />
              Database Persistence
            </h3>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '8px' }}>
                Connected to local MongoDB database: <code>mealmate</code>
              </p>
              <p style={{ marginBottom: '8px' }}>
                Collections: <code>users</code>, <code>recipes</code>, <code>mealplans</code>, <code>groceryitems</code>
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Inspect records in real-time using <strong>MongoDB Compass</strong> connected to <code>mongodb://127.0.0.1:27017</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
