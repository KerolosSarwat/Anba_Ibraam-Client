import React, { useState, useEffect } from 'react';
import { Gift, User, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AidManagement() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const aidToEdit = location.state?.aidToEdit;

  const [families, setFamilies] = useState([]);
  const [aidType, setAidType] = useState(aidToEdit ? aidToEdit.type : 'FAMILY');
  const [recurrenceType, setRecurrenceType] = useState(aidToEdit ? (aidToEdit.recurrenceType || 'NONE') : 'NONE');
  const [selectedFamily, setSelectedFamily] = useState(aidToEdit ? (aidToEdit.familyId || '') : '');
  const [selectedMember, setSelectedMember] = useState(aidToEdit ? (aidToEdit.memberId || (aidToEdit.type === 'INDIVIDUAL' && !aidToEdit.memberId ? 'HEAD' : '')) : '');
  const [formData, setFormData] = useState({
    description: aidToEdit ? aidToEdit.description : '',
    amount: aidToEdit ? aidToEdit.amount : ''
  });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      type: aidType,
      ...formData,
      recurrenceType,
      familyId: selectedFamily,
      memberId: aidType === 'INDIVIDUAL' ? (selectedMember === 'HEAD' ? null : selectedMember) : null
    };

    try {
      const url = aidToEdit ? `/api/aid/${aidToEdit.id}` : '/api/aid';
      const method = aidToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert(aidToEdit ? t('updateSuccess') || 'Aid Updated!' : t('aidSuccess'));
        if (aidToEdit) {
          navigate('/reports'); // Go back to history
        } else {
          setFormData({ description: '', amount: '' });
        }
      } else {
        alert(t('aidFail'));
      }
    } catch (err) {
      alert(t('alertError'));
    } finally {
      setLoading(false);
    }
  };

  const getSelectedFamilyMembers = () => {
    const family = families.find(f => f.id === selectedFamily);
    return family ? family.members : [];
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('aidTitle')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('aidSubtitle')}</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            type="button"
            className={`btn ${aidType === 'FAMILY' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setAidType('FAMILY')}
          >
            <Users size={18} /> {t('btnFamilyAid')}
          </button>
          <button
            type="button"
            className={`btn ${aidType === 'INDIVIDUAL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setAidType('INDIVIDUAL')}
          >
            <User size={18} /> {t('btnIndividualAid')}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('lblRecurrenceType') || 'Aid Recurrence'}</label>
            <select
              required
              className="form-input"
              value={recurrenceType}
              onChange={e => setRecurrenceType(e.target.value)}
            >
              <option value="NONE">{t('recurrenceCustom') || 'Custom (One-time)'}</option>
              <option value="MONTHLY">{t('recurrenceMonthly') || 'Monthly'}</option>
              <option value="YEARLY">{t('recurrenceYearly') || 'Yearly'}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('lblSelectFamily')}</label>
            <select
              required
              className="form-input"
              value={selectedFamily}
              onChange={e => setSelectedFamily(e.target.value)}
            >
              <option value="">{t('optChooseFamily')}</option>
              {families.map(f => (
                <option key={f.id} value={f.id}>{f.fullName} ({t('lblID')}: {f.nationalId})</option>
              ))}
            </select>
          </div>

          {aidType === 'INDIVIDUAL' && (
            <div className="form-group">
              <label className="form-label">{t('lblSelectMember')}</label>
              <select
                required
                className="form-input"
                value={selectedMember}
                onChange={e => setSelectedMember(e.target.value)}
                disabled={!selectedFamily}
              >
                <option value="">{t('optChooseMember')}</option>
                {/* Option for Head of Family */}
                {selectedFamily && (
                  <option value="HEAD" style={{ fontWeight: 'bold' }}>
                    {t('headOfFamily') || 'Head of Family'} ({families.find(f => f.id === selectedFamily)?.fullName})
                  </option>
                )}
                {getSelectedFamilyMembers().map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({t(`role${m.role}`) || m.role})</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">{t('lblAidDesc')}</label>
            <input
              required
              className="form-input"
              placeholder={t('phAidDesc')}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('lblAmount')}</label>
            <input
              required
              type="number"
              className="form-input"
              placeholder="0.00"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            <Gift size={18} />
            {loading ? t('processing') : (aidToEdit ? t('btnUpdate') : t('btnAssign'))}
          </button>
        </form>
      </div>
    </div>
  );
}
