import React, { useState } from 'react';
import api from '../services/api';

const DEFAULT_INTERESTS = ['AI', 'Web Development', 'Finance', 'Health', 'General'];

function Preferences({ user, setUser }) {
  const [interests, setInterests] = useState(user?.interests || []);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const savePreferences = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await api.post('/user/preferences', { interests });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setMessage('Preferences saved!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Your interests</h2>
      <p>Select categories to personalize your digest.</p>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      <div className="checkbox-grid">
        {DEFAULT_INTERESTS.map((interest) => (
          <label key={interest} className="checkbox">
            <input
              type="checkbox"
              checked={interests.includes(interest)}
              onChange={() => toggleInterest(interest)}
            />
            {interest}
          </label>
        ))}
      </div>
      <button className="btn btn-primary" onClick={savePreferences} disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}

export default Preferences;

