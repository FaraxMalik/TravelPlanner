import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await userAPI.getProfile();
        setUser(res.data.user);
        setFormData({ 
          name: res.data.user.name,
          email: res.data.user.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear messages when user starts typing
    if (success) setSuccess(false);
    if (error) setError(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    setUpdating(true);

    try {
      // Validate password confirmation if changing password
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        setUpdating(false);
        return;
      }

      // Prepare update data
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      // Only include password fields if user is changing password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await userAPI.updateProfile(updateData);
      
      setSuccess(true);
      setUser({ ...user, name: formData.name, email: formData.email });
      
      // Clear password fields after successful update
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Hide password fields
      setShowPasswordFields(false);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading-container">Loading...</div>;

  return (
    <div className="profile-page sleek-theme">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
          </div>
        </div>
        
        <form onSubmit={handleUpdate} className="profile-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text"
                name="name" 
                id="name"
                value={formData.name} 
                onChange={handleChange} 
                className="profile-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email"
                name="email" 
                id="email"
                value={formData.email} 
                onChange={handleChange} 
                className="profile-input"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <div className="password-section-header">
              <h3>Password</h3>
              <button 
                type="button" 
                className="toggle-password-btn"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
              >
                {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
              </button>
            </div>

            {showPasswordFields && (
              <>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input 
                    type="password"
                    name="currentPassword" 
                    id="currentPassword"
                    value={formData.currentPassword} 
                    onChange={handleChange} 
                    className="profile-input"
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input 
                    type="password"
                    name="newPassword" 
                    id="newPassword"
                    value={formData.newPassword} 
                    onChange={handleChange} 
                    className="profile-input"
                    placeholder="Enter new password (min 6 characters)"
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input 
                    type="password"
                    name="confirmPassword" 
                    id="confirmPassword"
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    className="profile-input"
                    placeholder="Confirm your new password"
                  />
                </div>
              </>
            )}
          </div>

          <button 
            type="submit" 
            className="profile-btn"
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
        
        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success">Profile updated successfully!</div>}
      </div>
    </div>
  );
};

export default Profile;
