import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.error || t('errRegistrationFailed'));
      }
    } catch (err) {
      setError(t('errConnection'));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>{t('registerTitle') || 'Create Account'}</h2>
        
        {error && (
          <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('lblName') || 'Full Name'}</label>
            <input 
              type="text" 
              required
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('lblEmail') || 'Email'}</label>
            <input 
              type="email" 
              required
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('lblPassword') || 'Password'}</label>
            <input 
              type="password" 
              required
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            {t('btnRegister') || 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          {t('hasAccount') || "Already have an account?"} <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('linkLogin') || 'Login'}</Link>
        </p>
      </div>
    </div>
  );
}
