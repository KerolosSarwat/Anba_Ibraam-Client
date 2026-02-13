import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { calculateAge } from '../utils/nationalId';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function FamilyList() {
  const { t } = useLanguage();
  const [families, setFamilies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/families', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setFamilies(data);
        } else {
          setFamilies([]);
          console.error('API returned non-array:', data);
        }
      })
      .catch(err => {
        console.error(err);
        setFamilies([]);
      });
  }, []);

  const filteredFamilies = families.filter(f =>
    f.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.nationalId.includes(searchTerm)
  );

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete') || 'Are you sure?')) return;

    try {
      const res = await fetch(`/api/families/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.ok) {
        setFamilies(families.filter(f => f.id !== id));
      } else {
        alert(t('alertFail') || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert(t('alertError') || 'Error occurred');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">{t('cardFamilies') || 'Families'}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('cardFamiliesDesc') || 'Manage families'}</p>
        </div>
        <Link to="/register-family" className="btn btn-primary">
          <Plus size={18} /> {t('navRegister') || 'New Family'}
        </Link>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Search size={20} color="var(--text-muted)" />
          <input
            className="form-input"
            placeholder={t('searchPlaceholder') || "Search by name or ID..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: '0.5rem' }}
          />
        </div>
      </div>

      <div className="glass-card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>{t('lblName') || 'Name'}</th>
              <th style={{ padding: '1rem' }}>{t('lblNationalId') || 'National ID'}</th>
              <th style={{ padding: '1rem' }}>{t('lblMembersCount') || 'Members'}</th>
              <th style={{ padding: '1rem' }}>{t('actions') || 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredFamilies.map(f => (
              <tr key={f.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '1rem' }}>{f.fullName}</td>
                <td style={{ padding: '1rem' }}>{f.nationalId}</td>
                <td style={{ padding: '1rem', overflow: 'visible' }}>
                  <div className="member-count-cell" style={{ display: 'inline-block' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {(f.members?.length || 0) + 1}
                    </span>
                    <div className="member-tooltip">
                      <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                        {t('cardFamilies')}:
                      </div>
                      {/* Head of Family */}
                      <div className="tooltip-item" style={{ borderBottom: '1px solid #eee', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{f.fullName}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '1rem' }}>
                          ({t('roleHead') || 'Head'}{calculateAge(f.nationalId) ? ` - ${calculateAge(f.nationalId)} ${t('years')}` : ''})
                        </span>
                      </div>
                      {f.members?.map((m, idx) => (
                        <div key={idx} className="tooltip-item">
                          <span>{m.name || t('lblUnknown')}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '1rem' }}>
                            {t(`role${m.role}`) || m.role}{calculateAge(m.nationalId) ? ` - ${calculateAge(m.nationalId)} ${t('years')}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => navigate(`/families/edit/${f.id}`)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem' }}
                    title={t('lblEdit')}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem', color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
                    title={t('delete') || "Delete"}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredFamilies.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {t('noFamiliesFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
