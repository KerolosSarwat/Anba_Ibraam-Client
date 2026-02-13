import React, { useState, useEffect } from 'react';
import { Shirt, FileText, Edit, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { calculateAge } from '../utils/nationalId';
import { useLanguage } from '../contexts/LanguageContext';

export default function Reports() {
  const { t } = useLanguage();
  const [clothingReport, setClothingReport] = useState([]);
  const [familyAidsReport, setFamilyAidsReport] = useState([]);
  const [visibleTab, setVisibleTab] = useState('CLOTHING'); // CLOTHING, HISTORY, or FAMILY_AIDS

  useEffect(() => {
    if (visibleTab === 'CLOTHING') {
      fetch('/api/reports/clothing', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setClothingReport(data);
          } else {
            setClothingReport([]);
            console.error('API returned non-array:', data);
          }
        })
        .catch(err => {
          console.error(err);
          setClothingReport([]);
        });
    } else if (visibleTab === 'FAMILY_AIDS') {
      fetch('/api/reports/family-aids', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFamilyAidsReport(data);
          } else {
            setFamilyAidsReport([]);
            console.error('API returned non-array:', data);
          }
        })
        .catch(err => {
          console.error(err);
          setFamilyAidsReport([]);
        });
    }
  }, [visibleTab]);

  const exportClothing = () => {
    const rows = [];
    clothingReport.forEach(f => {
      f.members.forEach(m => {
        rows.push({
          [t('thFamilyName')]: f.familyName,
          [t('thMember')]: m.name,
          [t('thRole')]: t(`role${m.role}`) || m.role,
          [t('thSize')]: m.clothingSize,
          [t('memberSizeDetails')]: m.clothingDetails
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clothing");
    XLSX.writeFile(wb, "ClothingSheet.xlsx");
  };

  const exportFamilyStatus = () => {
    const rows = familyAidsReport.map(f => ({
      [t('thFamilyName')]: f.fullName,
      [t('lblPhoneShort')]: f.phone,
      [t('lblID')]: f.nationalId,
      [t('lblIncome')]: f.income,
      [t('lblTotalAid')]: ((f.familyAids || []).reduce((s, a) => s + a.amount, 0) + (f.members || []).reduce((s, m) => s + (m.individualAids || []).reduce((ss, aa) => ss + aa.amount, 0), 0)),
      [t('lblMembersCount')]: f.members?.length || 0
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FamilyStatus");
    XLSX.writeFile(wb, "FamilyStatus.xlsx");
  };

  const exportMembers = () => {
    const rows = familyAidsReport.flatMap(family => {
      const head = {
        [t('thFamilyName')]: family.fullName,
        [t('thMember')]: family.fullName,
        [t('thRole')]: t('roleHead') || 'Head',
        [t('lblAge')]: calculateAge(family.nationalId),
        [t('lblID')]: family.nationalId,
        [t('lblPhoneShort')]: family.phone,
        [t('memberJob')]: family.job,
        [t('memberStatus')]: t('status' + family.socialStatus) || family.socialStatus
      };
      const members = (family.members || []).map(m => ({
        [t('thFamilyName')]: family.fullName,
        [t('thMember')]: m.name,
        [t('thRole')]: t(`role${m.role}`) || m.role,
        [t('lblAge')]: calculateAge(m.nationalId),
        [t('lblID')]: m.nationalId,
        [t('lblPhoneShort')]: '-',
        [t('memberJob')]: [m.job, m.educationLevel].filter(Boolean).join(' / '),
        [t('memberStatus')]: t('status' + m.socialStatus) || m.socialStatus
      }));
      return [head, ...members];
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "MembersDetails.xlsx");
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('repTitle')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('repSubtitle')}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button
          className={`btn ${visibleTab === 'CLOTHING' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ marginRight: '1rem', marginLeft: '1rem' }} // Add margin for both directions
          onClick={() => setVisibleTab('CLOTHING')}
        >
          <Shirt size={18} /> {t('btnClothingSheet')}
        </button>
        <button
          className={`btn ${visibleTab === 'HISTORY' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setVisibleTab('HISTORY')}
        >
          <FileText size={18} /> {t('btnAidHistory')}
        </button>
        <button
          className={`btn ${visibleTab === 'FAMILY_AIDS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ marginLeft: '1rem' }}
          onClick={() => setVisibleTab('FAMILY_AIDS')}
        >
          <Users size={18} /> {t('btnFamilyStatus') || 'Family Status'}
        </button>
        <button
          className={`btn ${visibleTab === 'MEMBERS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ marginLeft: '1rem' }}
          onClick={() => {
            setVisibleTab('MEMBERS');
            // Similar to Family Aids, we need the data loaded.
            // Reuse the fetch logic from FAMILY_AIDS because it gets the same data structure
            // We can just trigger the fetch if empty or rely on the user having visited FAMILY_AIDS?
            // Better to duplicate the fetch trigger logic or consolidate
            if (familyAidsReport.length === 0) {
              fetch('/api/reports/family-aids', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              })
                .then(res => res.json())
                .then(data => Array.isArray(data) ? setFamilyAidsReport(data) : setFamilyAidsReport([]))
                .catch(console.error);
            }
          }}
        >
          <Users size={18} /> {t('btnMembersReport') || 'Members'}
        </button>
      </div>

      {visibleTab === 'CLOTHING' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ marginTop: 0 }}>{t('btnClothingSheet')}</h3>
            <button onClick={exportClothing} className="btn btn-secondary">{t('btnExport')}</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'inherit' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem' }}>{t('thFamilyName')}</th>
                  <th style={{ padding: '1rem' }}>{t('thMember')}</th>
                  <th style={{ padding: '1rem' }}>{t('thRole')}</th>
                  <th style={{ padding: '1rem' }}>{t('thSize')}</th>
                  <th style={{ padding: '1rem' }}>تفاصيل اللبس</th>

                </tr>
              </thead>
              <tbody>
                {clothingReport.map((family, fIdx) => (
                  <React.Fragment key={fIdx}>
                    {family.members.map((member, mIdx) => (
                      <tr key={`${fIdx}-${mIdx}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        {mIdx === 0 && (
                          <td
                            rowSpan={family.members.length}
                            style={{ padding: '1rem', verticalAlign: 'top', fontWeight: 600, color: 'var(--primary)' }}
                          >
                            {family.familyName}
                          </td>
                        )}
                        <td style={{ padding: '1rem' }}>
                          {member.name}
                          {calculateAge(member.nationalId) && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>{calculateAge(member.nationalId)} {t('years')}</span>}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t(`role${member.role}`) || member.role}</td>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>
                          <span style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                          }}>
                            {member.clothingSize || '-'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>{member.clothingDetails}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {visibleTab === 'HISTORY' && (
        <div className="glass-card">
          <AidHistoryTable t={t} />
        </div>
      )}

      {visibleTab === 'FAMILY_AIDS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={exportFamilyStatus} className="btn btn-secondary">{t('btnExport')}</button>
          </div>
          {familyAidsReport.length === 0 && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              {t('noFamiliesFound')}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {familyAidsReport.map(family => (
              <FamilyStatusCard key={family.id} family={family} t={t} />
            ))}
          </div>
        </div>
      )}

      {visibleTab === 'MEMBERS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={exportMembers} className="btn btn-secondary">{t('btnExport')}</button>
          </div>
          {familyAidsReport.length === 0 && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              {t('noFamiliesFound')}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {familyAidsReport.map(family => (
              <FamilyMembersCard key={family.id} family={family} t={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function FamilyMembersCard({ family, t }) {
  const [isHovered, setIsHovered] = useState(false);

  // Prepare members list including head
  const head = {
    id: family.id + '_head',
    name: family.fullName,
    role: 'Head',
    nationalId: family.nationalId,
    phone: family.phone,
    job: family.job,
    socialStatus: family.socialStatus,
    isHead: true,
  };

  const members = [head, ...(family.members || []).map(m => ({ ...m, isHead: false }))];

  return (
    <div
      className="glass-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: 'all 0.3s ease',
        cursor: 'default',
        padding: '1.5rem',
        border: isHovered ? '1px solid var(--primary)' : '1px solid transparent'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>{family.fullName}</h3>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {t('lblMembersCount')}: {members.length}
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div style={{
        maxHeight: isHovered ? '2000px' : '0',
        opacity: isHovered ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.4s ease-in-out',
        marginTop: isHovered ? '1.5rem' : '0'
      }}>
        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0 0 1.5rem 0' }} />

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'inherit', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ padding: '0.75rem' }}>{t('thMember')}</th>
                <th style={{ padding: '0.75rem' }}>{t('thRole')}</th>
                <th style={{ padding: '0.75rem' }}>{t('lblAge')}</th>
                <th style={{ padding: '0.75rem' }}>{t('lblID')}</th>
                <th style={{ padding: '0.75rem' }}>{t('lblPhoneShort')}</th>
                <th style={{ padding: '0.75rem' }}>{t('memberJob')} / {t('memberEducation')}</th>
                <th style={{ padding: '0.75rem' }}>{t('memberStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((item, idx) => (
                <tr key={item.id || idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem', fontWeight: item.isHead ? 600 : 400 }}>{item.name}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{item.isHead ? (t('roleHead') || 'Head') : (t(`role${item.role}`) || item.role)}</td>
                  <td style={{ padding: '0.75rem' }}>{calculateAge(item.nationalId) || '-'}</td>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{item.nationalId || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>{item.phone || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {item.job ? item.job : ''}
                    {item.job && item.educationLevel ? ' / ' : ''}
                    {item.educationLevel ? item.educationLevel : ''}
                    {!item.job && !item.educationLevel ? '-' : ''}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {item.socialStatus ? (t('status' + item.socialStatus) || item.socialStatus) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FamilyStatusCard({ family, t }) {
  const [isHovered, setIsHovered] = useState(false);

  const allAids = [
    ...(family.familyAids || []).map(a => ({ ...a, beneficiary: a.type === 'INDIVIDUAL' ? family.fullName : 'Family' })),
    ...(family.members || []).flatMap(m => (m.individualAids || []).map(a => ({ ...a, beneficiary: m.name })))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalAid = allAids.reduce((sum, a) => sum + (a.amount || 0), 0);

  return (
    <div
      className="glass-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: 'all 0.3s ease',
        cursor: 'default',
        padding: '1.5rem',
        border: isHovered ? '1px solid var(--primary)' : '1px solid transparent'
      }}
    >
      {/* Header: Always Visible */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>{family.fullName}</h3>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {t('lblID')}: {family.nationalId}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
            EGP {totalAid}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('lblTotalAid')}</div>
        </div>
      </div>

      {/* Expandable Content */}
      <div style={{
        maxHeight: isHovered ? '2000px' : '0',
        opacity: isHovered ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.4s ease-in-out',
        marginTop: isHovered ? '1.5rem' : '0'
      }}>
        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0 0 1.5rem 0' }} />

        {/* Full Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <div><span style={{ fontWeight: 600 }}>{t('lblPhoneShort')}:</span> {family.phone}</div>
          <div><span style={{ fontWeight: 600 }}>{t('lblIncome')}:</span> EGP {family.income}</div>
          <div><span style={{ fontWeight: 600 }}>{t('lblAge')}:</span> {calculateAge(family.nationalId) || '-'} {calculateAge(family.nationalId) ? t('years') : ''}</div>
          <div><span style={{ fontWeight: 600 }}>{t('lblMembersCount')}:</span> {family.members?.length || 0}</div>
          <div style={{ gridColumn: '1 / -1' }}><span style={{ fontWeight: 600 }}>{t('lblAddress')}:</span> {family.address}</div>
          {family.job && <div><span style={{ fontWeight: 600 }}>{t('memberJob')}:</span> {family.job}</div>}
          {family.socialStatus && <div><span style={{ fontWeight: 600 }}>{t('memberStatus')}:</span> {t('status' + family.socialStatus) || family.socialStatus}</div>}
        </div>

        {/* Aid History Table */}
        <div>
          <h4 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>{t('btnAidHistory')}</h4>
          {allAids.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>{t('thDate')}</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>{t('thBeneficiary')}</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>{t('thType')}</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>{t('thDesc')}</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>{t('thAmount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {allAids.map((aid, idx) => (
                    <tr key={aid.id || idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.5rem' }}>{new Date(aid.date).toLocaleDateString()}</td>
                      <td style={{ padding: '0.5rem' }}>{aid.beneficiary}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: aid.type === 'FAMILY' ? '#fdf2f8' : '#eff6ff',
                          color: aid.type === 'FAMILY' ? '#be185d' : '#1d4ed8'
                        }}>
                          {t('type' + aid.type) || aid.type}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem' }}>{aid.description}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>EGP {aid.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {t('msgNoAidHistory')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AidHistoryTable({ t }) {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page,
      limit: 10
    });

    // Use month/year filtering if set, otherwise use date range
    if (filterMonth && filterYear) {
      params.append('month', filterMonth);
      params.append('year', filterYear);
    } else {
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
    }

    fetch(`/api/aid?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(result => {
        if (result.data && Array.isArray(result.data)) {
          setHistory(result.data);
          setTotalPages(result.meta.totalPages);
        } else {
          // Fallback for old API if needed, though we updated it
          setHistory(Array.isArray(result) ? result : []);
        }
      })
      .catch(err => {
        console.error(err);
        setHistory([]);
      })
      .finally(() => setLoading(false));
  }, [page, startDate, endDate, filterMonth, filterYear]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete') || 'Are you sure?')) return;
    try {
      const res = await fetch(`/api/aid/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        setHistory(history.filter(h => h.id !== id));
      } else {
        alert(t('aidFail') || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert(t('alertError'));
    }
  };

  const exportHistory = async () => {
    try {
      const params = new URLSearchParams({ limit: 100000 }); // Fetch all
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/aid?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await res.json();
      const data = result.data || [];

      const rows = data.map(item => ({
        [t('thDate')]: new Date(item.date).toLocaleDateString(),
        [t('thType')]: t('type' + item.type) || item.type,
        [t('thBeneficiary')]: item.type === 'FAMILY'
          ? item.family?.fullName
          : `${item.member?.name || (item.family?.fullName || t('unknownFamily'))}${item.member?.name && item.family?.fullName ? ` (${item.family.fullName})` : ''}`,
        [t('thDesc')]: item.description,
        [t('thAmount')]: item.amount
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "History");
      XLSX.writeFile(wb, "AidHistory.xlsx");
    } catch (e) {
      console.error(e);
      alert(t('alertError'));
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>{t('btnAidHistory')}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={exportHistory} className="btn btn-secondary" style={{ marginRight: '1rem' }}>
            {t('btnExport')}
          </button>

          {/* Month/Year Filter for Recurring Aids */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{t('lblMonth') || 'Month'}</label>
              <select
                className="form-input"
                style={{ padding: '0.25rem', fontSize: '0.9rem', minWidth: '100px' }}
                value={filterMonth}
                onChange={(e) => {
                  setFilterMonth(e.target.value);
                  setStartDate('');
                  setEndDate('');
                  setPage(1);
                }}
              >
                <option value="">{t('optAll') || 'All'}</option>
                <option value="1">{t('monthJan') || 'January'}</option>
                <option value="2">{t('monthFeb') || 'February'}</option>
                <option value="3">{t('monthMar') || 'March'}</option>
                <option value="4">{t('monthApr') || 'April'}</option>
                <option value="5">{t('monthMay') || 'May'}</option>
                <option value="6">{t('monthJun') || 'June'}</option>
                <option value="7">{t('monthJul') || 'July'}</option>
                <option value="8">{t('monthAug') || 'August'}</option>
                <option value="9">{t('monthSep') || 'September'}</option>
                <option value="10">{t('monthOct') || 'October'}</option>
                <option value="11">{t('monthNov') || 'November'}</option>
                <option value="12">{t('monthDec') || 'December'}</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{t('lblYear') || 'Year'}</label>
              <select
                className="form-input"
                style={{ padding: '0.25rem', fontSize: '0.9rem', minWidth: '80px' }}
                value={filterYear}
                onChange={(e) => {
                  setFilterYear(e.target.value);
                  setStartDate('');
                  setEndDate('');
                  setPage(1);
                }}
              >
                <option value="">{t('optAll') || 'All'}</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>
          </div>

          {/* Date Range Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('lblFromDate')}</label>
              <input
                type="date"
                className="form-input"
                style={{ padding: '0.25rem', fontSize: '0.9rem' }}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setFilterMonth('');
                  setFilterYear('');
                  setPage(1);
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('lblToDate')}</label>
              <input
                type="date"
                className="form-input"
                style={{ padding: '0.25rem', fontSize: '0.9rem' }}
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setFilterMonth('');
                  setFilterYear('');
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('loading')}</div>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'inherit' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '1rem' }}>{t('thDate')}</th>
                <th style={{ padding: '1rem' }}>{t('thType')}</th>
                <th style={{ padding: '1rem' }}>{t('lblRecurrenceType') || 'Recurrence'}</th>
                <th style={{ padding: '1rem' }}>{t('thBeneficiary')}</th>
                <th style={{ padding: '1rem' }}>{t('thDesc')}</th>
                <th style={{ padding: '1rem' }}>{t('thAmount')}</th>
                <th style={{ padding: '1rem' }}>{t('actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem' }}>{new Date(item.date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: item.type === 'FAMILY' ? '#fdf2f8' : '#eff6ff',
                      color: item.type === 'FAMILY' ? '#be185d' : '#1d4ed8',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {t('type' + item.type) || item.type}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: item.recurrenceType === 'MONTHLY' ? '#ecfdf5' : (item.recurrenceType === 'YEARLY' ? '#fef3c7' : '#f3f4f6'),
                      color: item.recurrenceType === 'MONTHLY' ? '#047857' : (item.recurrenceType === 'YEARLY' ? '#d97706' : '#6b7280'),
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {item.recurrenceType === 'MONTHLY' ? (t('recurrenceMonthly') || 'Monthly') : (item.recurrenceType === 'YEARLY' ? (t('recurrenceYearly') || 'Yearly') : (t('recurrenceCustom') || 'One-time'))}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {item.type === 'FAMILY'
                      ? item.family?.fullName
                      : `${item.member?.name || (item.family?.fullName || t('unknownFamily'))}${item.member?.name && item.family?.fullName ? ` (${item.family.fullName})` : ''}`
                    }
                  </td>
                  <td style={{ padding: '1rem' }}>{item.description}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>EGP {item.amount}</td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => navigate('/aid-management', { state: { aidToEdit: item } })}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      title={t('lblEdit')}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
                      title={t('delete')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('noRecords')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('btnPrev')}
              </button>
              <span style={{ color: 'var(--text-secondary)' }}>
                {t('lblPage')} {page} / {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t('btnNext')}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
