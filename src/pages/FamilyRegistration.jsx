import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

export default function FamilyRegistration() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [memberCount, setMemberCount] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '', // 14 digits
    address: '',
    phone: '', // 11 digits
    income: '',
    job: '',
    socialStatus: 'Married', // Default for head of family usually
    educationLevel: '',
    clothingSize: '',
    clothingDetails: '',
    members: []
  });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      fetch(`${API_URL}/api/families/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setFormData({
            ...data,
            income: data.income?.toString() || ''
          });
          setMemberCount(data.members?.length || 0);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  // Initialize members based on count
  const handleMemberCountChange = (e) => {
    const count = parseInt(e.target.value) || 0;
    setMemberCount(count);

    // Resize members array while preserving existing data
    setFormData(prev => {
      const currentMembers = prev.members;
      let newMembers = [...currentMembers];

      if (count > currentMembers.length) {
        // Add new members
        for (let i = currentMembers.length; i < count; i++) {
          newMembers.push({
            name: '',
            role: 'Other',
            clothingSize: '',
            nationalId: '',
            phone: '',
            address: formData.address || '', // Default to family address
            income: '',
            clothingDetails: '',
            job: '',
            socialStatus: 'Single',
            educationLevel: ''
          });
        }
      } else {
        // Truncate
        newMembers = newMembers.slice(0, count);
      }

      return { ...prev, members: newMembers };
    });
  };

  const handleFamilyChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...formData.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData({ ...formData, members: newMembers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing ? `${API_URL}/api/families/${id}` : `${API_URL}/api/families`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(t('alertSuccess'));
        if (isEditing) {
          navigate('/families');
        } else {
          // Reset form
          setFormData({
            fullName: '',
            nationalId: '',
            address: '',
            phone: '',
            income: '',
            job: '',
            socialStatus: 'Married',
            educationLevel: '',
            clothingSize: '',
            clothingDetails: '',
            members: []
          });
          setMemberCount(0);
        }
      } else {
        const data = await response.json();
        alert(data.error || t('alertFail'));
      }
    } catch (error) {
      console.error(error);
      alert(t('alertError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEditing ? t('editTitle') || 'Edit Family' : t('regTitle')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('regSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card">
        <h3 style={{ marginTop: 0 }}>{t('headDetails')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">{t('lblFullName')}</label>
            <input
              required
              name="fullName"
              value={formData.fullName}
              onChange={handleFamilyChange}
              className="form-input"
              placeholder={t('phFullName')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('lblNationalId')}</label>
            <input
              required
              name="nationalId"
              value={formData.nationalId}
              onChange={handleFamilyChange}
              minLength={14}
              maxLength={14}
              className="form-input"
              placeholder={t('phNationalId')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('lblPhone')}</label>
            <input
              required
              name="phone"
              value={formData.phone}
              onChange={handleFamilyChange}
              minLength={11}
              maxLength={11}
              className="form-input"
              placeholder={t('phPhone')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('lblIncome')}</label>
            <input
              required
              type="number"
              name="income"
              value={formData.income}
              onChange={handleFamilyChange}
              className="form-input"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{t('lblAddress')}</label>
          <input
            required
            name="address"
            value={formData.address}
            onChange={handleFamilyChange}
            className="form-input"
            placeholder={t('phAddress')}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">{t('memberJob')}</label>
            <input
              name="job"
              value={formData.job}
              onChange={handleFamilyChange}
              className="form-input"
              placeholder={t('phJob')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('memberStatus')}</label>
            <select
              name="socialStatus"
              value={formData.socialStatus}
              onChange={handleFamilyChange}
              className="form-input"
            >
              <option value="Single">{t('statusSingle')}</option>
              <option value="Married">{t('statusMarried')}</option>
              <option value="Widow">{t('statusWidow')}</option>
              <option value="Divorced">{t('statusDivorced')}</option>
            </select>
          </div>
        </div>

        {formData.job && formData.job.toLowerCase().includes('student') && (
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">{t('memberEducation')}</label>
            <input
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleFamilyChange}
              className="form-input"
              placeholder={t('phEducation')}
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">{t('memberSize')}</label>
            <select
              name="clothingSize"
              value={formData.clothingSize}
              onChange={handleFamilyChange}
              className="form-input"
            >
              <option value="">{t('optSelectSize')}</option>
              <option>XS</option>
              <option>S</option>
              <option>M</option>
              <option>L</option>
              <option>XL</option>
              <option>XXL</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('memberSizeDetails')}</label>
            <input
              name="clothingDetails"
              value={formData.clothingDetails}
              onChange={handleFamilyChange}
              className="form-input"
              placeholder={t('phClothingDetails')}
            />
          </div>
        </div>

        <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

        <h3>{t('cardFamilies')}</h3>
        <div className="form-group" style={{ maxWidth: '200px' }}>
          <label className="form-label">{t('lblMembersCount')}</label>
          <input
            type="number"
            min="1"
            value={memberCount}
            onChange={handleMemberCountChange}
            className="form-input"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formData.members.map((member, index) => (
            <div key={index} style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>{t('memberTitle')} #{index + 1}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>{t('memberName')}</label>
                  <input
                    required
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                    className="form-input"
                    placeholder={t('phMemberName')}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>{t('lblNationalId')}</label>
                  <input
                    value={member.nationalId}
                    onChange={(e) => handleMemberChange(index, 'nationalId', e.target.value)}
                    className="form-input"
                    placeholder={t('phNationalIdOpt')}
                    maxLength={14}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>{t('lblPhone')}</label>
                  <input
                    value={member.phone}
                    onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                    className="form-input"
                    placeholder={t('phPhoneOpt')}
                    maxLength={11}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>{t('lblAddress')}</label>
                  <input
                    value={member.address}
                    onChange={(e) => handleMemberChange(index, 'address', e.target.value)}
                    className="form-input"
                    placeholder={t('phAddressOpt')}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>{t('lblIncome')}</label>
                  <input
                    type="number"
                    value={member.income}
                    onChange={(e) => handleMemberChange(index, 'income', e.target.value)}
                    className="form-input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>{t('memberSize')}</label>
                  <select
                    value={member.clothingSize}
                    onChange={(e) => handleMemberChange(index, 'clothingSize', e.target.value)}
                    className="form-input"
                  >
                    <option value="">{t('optSelectSize')}</option>
                    <option>XS</option>
                    <option>S</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                    <option>XXL</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>{t('memberRole')}</label>
                  <select
                    value={member.role}
                    onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                    className="form-input"
                    style={{ width: '100%' }}
                  >
                    <option value="Father">{t('roleFather')}</option>
                    <option value="Mother">{t('roleMother')}</option>
                    <option value="Son">{t('roleSon')}</option>
                    <option value="Daughter">{t('roleDaughter')}</option>
                    <option value="Grandparent">{t('roleGrandparent')}</option>
                    <option value="Other">{t('roleOther')}</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>{t('memberStatus')}</label>
                  <select
                    value={member.socialStatus}
                    onChange={(e) => handleMemberChange(index, 'socialStatus', e.target.value)}
                    className="form-input"
                    style={{ width: '100%' }}
                  >
                    <option value="Single">{t('statusSingle')}</option>
                    <option value="Married">{t('statusMarried')}</option>
                    <option value="Widow">{t('statusWidow')}</option>
                    <option value="Divorced">{t('statusDivorced')}</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>{t('memberJob')}</label>
                  <input
                    value={member.job}
                    onChange={(e) => handleMemberChange(index, 'job', e.target.value)}
                    className="form-input"
                    placeholder={t('phJob')}
                  />
                </div>
              </div>

              {member.job && member.job.toLowerCase().includes('طالب') && (
                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>{t('memberEducation')}</label>
                  <input
                    value={member.educationLevel}
                    onChange={(e) => handleMemberChange(index, 'educationLevel', e.target.value)}
                    className="form-input"
                    placeholder={t('phEducation')}
                  />
                </div>
              )}

              <div style={{ marginTop: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>{t('memberSizeDetails')}</label>
                <input
                  value={member.clothingDetails}
                  onChange={(e) => handleMemberChange(index, 'clothingDetails', e.target.value)}
                  className="form-input"
                  placeholder={t('phClothingDetails')}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={18} />
            {loading ? t('registering') : t('btnRegister')}
          </button>
        </div>
      </form>
    </div>
  );
}
