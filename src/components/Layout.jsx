import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Users, Heart, ClipboardList, Globe, LogOut, Moon, Sun } from 'lucide-react'; // Added icons
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout() {
  const { t, toggleLanguage, language } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', [language === 'ar' ? 'marginLeft' : 'marginRight']: 'auto', fontWeight: 'bold', fontSize: '1.2rem', gap: '0.5rem' }}>
          <Heart fill="var(--secondary)" color="var(--secondary)" />
          <span>{t('appName')}</span>
        </div>

        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={18} /> {t('navDashboard')}
          </div>
        </NavLink>

        <NavLink to="/families" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} /> {t('cardFamilies')}
          </div>
        </NavLink>

        <NavLink to="/aid-management" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={18} /> {t('navAid')}
          </div>
        </NavLink>

        <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={18} /> {t('navReports')}
          </div>
        </NavLink>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', borderLeft: '1px solid var(--input-border)', paddingLeft: '1rem' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{ padding: '0.5rem' }}
            title={t('ttTheme')}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            onClick={toggleLanguage}
            className="btn btn-secondary"
            style={{ padding: '0.5rem' }}
            title={t('ttLanguage')}
          >
            <Globe size={18} /> {language === 'en' ? 'عربي' : 'English'}
          </button>

          {user && (
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ padding: '0.5rem', color: '#ef4444', borderColor: '#fee2e2', background: 'rgba(254, 242, 242, 0.1)' }}
              title={t('logout')}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </nav>

      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}

