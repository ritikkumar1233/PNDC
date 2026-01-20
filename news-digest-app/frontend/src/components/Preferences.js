import React, { useState } from 'react';
import api from '../services/api';

const SUGGESTED_PREFERENCES = [
  'AI',
  'Web Development',
  'Startups',
  'Sports',
  'Finance',
  'Politics',
  'Health',
  'Education',
  'Climate',
  'Crypto',
];

function Preferences({ user, setUser }) {
  const [interests, setInterests] = useState(user?.interests || []);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const addInterest = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setInterests((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed]
    );
    setInputValue('');
  };

  const removeInterest = (interest) => {
    setInterests((prev) => prev.filter((i) => i !== interest));
  };

  const savePreferences = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await api.post('/user/preferences', { interests });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem(
        'userPreferences',
        JSON.stringify(res.data.user.interests || [])
      );
      setUser(res.data.user);
      setMessage('Preferences saved!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest(inputValue);
    }
  };

  return (
    <div className="card space-y-4">
      <div>
        <h2>Your interests</h2>
        <p className="muted text-sm">
          Add custom topics or pick from suggestions to personalize your digest.
        </p>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div>
        <label>
          Add a preference
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="e.g. Space Tech, Cricket IPL, Bihar Jobs"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => addInterest(inputValue)}
              disabled={!inputValue.trim()}
            >
              Add
            </button>
          </div>
        </label>
      </div>

      <div>
        <div className="text-sm font-medium text-slate-100 mb-2">
          Suggested preferences
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PREFERENCES.map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => addInterest(pref)}
              className="px-3 py-1 text-xs rounded-full border border-slate-600 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-slate-100 mb-2">
          Your selected preferences
        </div>
        {interests.length === 0 ? (
          <p className="muted text-sm">
            You haven&apos;t added any preferences yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-100"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeInterest(interest)}
                  className="ml-1 text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        className="btn btn-primary"
        onClick={savePreferences}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save preferences'}
      </button>
    </div>
  );
}

export default Preferences;

