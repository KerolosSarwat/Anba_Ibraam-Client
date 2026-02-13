import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import FamilyRegistration from './pages/FamilyRegistration'
import AidManagement from './pages/AidManagement'
import Reports from './pages/Reports'
import FamilyList from './pages/FamilyList'
import { useLanguage } from './contexts/LanguageContext'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider } from './contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="glass-card" style={{padding: '2rem', textAlign: 'center'}}>{useLanguage().t('loading') || 'Loading...'}</div>;
  if (!user) return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>{useLanguage().t('msgLoginRequired') || 'Please Login to view this page.'} <a href="/login" style={{color: 'var(--primary)'}}>{useLanguage().t('btnLogin')}</a></div>;
  return children;
};

function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="glass-card">
      <h2 style={{ marginTop: 0 }}>{t('welcomeTitle')}</h2>
      <p>{t('welcomeDesc')}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
        <a href="/families" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ padding: '1.5rem', background: '#eff6ff', borderRadius: '12px' }}>
            <h3 style={{ color: '#1e40af', margin: '0 0 0.5rem 0' }}>{t('cardFamilies')}</h3>
            <p style={{ margin: 0, color: '#1e3a8a' }}>{t('cardFamiliesDesc')}</p>
          </div>
        </a>
        <a href="/aid-management" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ padding: '1.5rem', background: '#fdf2f8', borderRadius: '12px' }}>
            <h3 style={{ color: '#be185d', margin: '0 0 0.5rem 0' }}>{t('cardAid')}</h3>
            <p style={{ margin: 0, color: '#831843' }}>{t('cardAidDesc')}</p>
          </div>
        </a>
        <a href="/reports" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '12px' }}>
            <h3 style={{ color: '#15803d', margin: '0 0 0.5rem 0' }}>{t('cardReports')}</h3>
            <p style={{ margin: 0, color: '#14532d' }}>{t('cardReportsDesc')}</p>
          </div>
        </a>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/families" element={<ProtectedRoute><FamilyList /></ProtectedRoute>} />
          <Route path="/families/edit/:id" element={<ProtectedRoute><FamilyRegistration /></ProtectedRoute>} />
          <Route path="/register-family" element={<ProtectedRoute><FamilyRegistration /></ProtectedRoute>} />
          <Route path="/aid-management" element={<ProtectedRoute><AidManagement /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
