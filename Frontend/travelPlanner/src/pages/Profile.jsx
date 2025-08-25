import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await userAPI.getProfile();
        setUser(res.data.user);
        setFormData({ name: res.data.user.name });
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
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    try {
      await userAPI.updateProfile(formData);
      setSuccess(true);
      setUser({ ...user, name: formData.name });
    } catch (err) {
      setError('Update failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-page sleek-theme">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{user?.name?.[0] || 'U'}</div>
          <div>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
          </div>
        </div>
        <form onSubmit={handleUpdate} className="profile-form">
          <label htmlFor="name">Name</label>
          <input name="name" value={formData.name} onChange={handleChange} className="profile-input" />
          <button type="submit" className="profile-btn">Update</button>
        </form>
        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success">Profile updated!</div>}
      </div>
    </div>
  );
};

export default Profile;
