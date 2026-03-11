import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Account = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [addressForm, setAddressForm] = useState({ name: '', street: '', city: '', state: '', zip: '', country: 'US', isDefault: false });
  const [loading, setLoading] = useState(false);

  if (!user) { navigate('/login'); return null; }

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authAPI.updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password updated!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update password'); }
    finally { setLoading(false); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.addAddress(addressForm);
      updateUser(res.data.user);
      toast.success('Address added!');
      setAddressForm({ name: '', street: '', city: '', state: '', zip: '', country: 'US', isDefault: false });
    } catch (err) { toast.error('Failed to add address'); }
    finally { setLoading(false); }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await authAPI.deleteAddress(id);
      updateUser(res.data.user);
      toast.success('Address removed');
    } catch { toast.error('Failed to remove address'); }
  };

  const tabs = [
    { key: 'profile', icon: '👤', label: 'Profile' },
    { key: 'password', icon: '🔒', label: 'Password' },
    { key: 'addresses', icon: '📍', label: 'Addresses' },
  ];

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: 900 }}>
      <h1 style={{ fontSize: 32, marginBottom: 32 }}>My Account</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>
        {/* Sidebar */}
        <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '1px solid var(--border)', position: 'sticky', top: 80 }}>
          <div style={{ textAlign: 'center', padding: '16px 0 20px', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
            <img src={user.avatar} alt={user.name} style={{ width: 72, height: 72, borderRadius: '50%', marginBottom: 10 }} />
            <div style={{ fontWeight: 700, fontSize: 15 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{user.email}</div>
            {user.role === 'admin' && <span className="badge badge-accent" style={{ marginTop: 6 }}>Admin</span>}
          </div>
          {tabs.map(({ key, icon, label }) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: activeTab === key ? 'var(--accent-light)' : 'transparent', color: activeTab === key ? 'var(--accent)' : 'var(--slate)', fontWeight: activeTab === key ? 600 : 400, fontSize: 14, transition: 'all 0.2s', textAlign: 'left' }}>
              <span>{icon}</span> {label}
            </button>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
            <button onClick={() => { logout(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--error)', fontSize: 14 }}>
              🚪 Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="card" style={{ padding: 32 }}>
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ marginBottom: 24 }}>Profile Information</h2>
              <form onSubmit={handleProfileSave}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className="form-control" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={user.email} className="form-control" disabled style={{ background: 'var(--surface)', color: 'var(--muted)' }} />
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Email cannot be changed</p>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} className="form-control" placeholder="+1 (555) 000-0000" />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div>
              <h2 style={{ marginBottom: 24 }}>Change Password</h2>
              <form onSubmit={handlePasswordChange} style={{ maxWidth: 400 }}>
                {[
                  { key: 'currentPassword', label: 'Current Password' },
                  { key: 'newPassword', label: 'New Password' },
                  { key: 'confirmPassword', label: 'Confirm New Password' },
                ].map(({ key, label }) => (
                  <div className="form-group" key={key}>
                    <label>{label}</label>
                    <input type="password" value={passwordForm[key]} onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))} className="form-control" placeholder="••••••••" required />
                  </div>
                ))}
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h2 style={{ marginBottom: 24 }}>Saved Addresses</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {user.addresses?.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>No saved addresses yet</p>
                ) : user.addresses?.map(addr => (
                  <div key={addr.id} style={{ padding: 16, border: `1.5px solid ${addr.isDefault ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {addr.name}
                        {addr.isDefault && <span className="badge badge-accent" style={{ fontSize: 10 }}>Default</span>}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{addr.street}, {addr.city}, {addr.state} {addr.zip}</div>
                    </div>
                    <button onClick={() => handleDeleteAddress(addr.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: 16 }}>🗑️</button>
                  </div>
                ))}
              </div>

              <h3 style={{ marginBottom: 16, fontSize: 18 }}>Add New Address</h3>
              <form onSubmit={handleAddAddress}>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={addressForm.name} onChange={e => setAddressForm(p => ({ ...p, name: e.target.value }))} className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label>Street Address</label>
                    <input type="text" value={addressForm.street} onChange={e => setAddressForm(p => ({ ...p, street: e.target.value }))} className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" value={addressForm.city} onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))} className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input type="text" value={addressForm.state} onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))} className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input type="text" value={addressForm.zip} onChange={e => setAddressForm(p => ({ ...p, zip: e.target.value }))} className="form-control" required />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 16, cursor: 'pointer' }}>
                  <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm(p => ({ ...p, isDefault: e.target.checked }))} style={{ accentColor: 'var(--accent)' }} />
                  Set as default address
                </label>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Adding...' : 'Add Address'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 220px"]{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
};

export default Account;
