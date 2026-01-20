import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Dashboard({ user }) {
  const [digest, setDigest] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [digestRes, newsRes] = await Promise.all([
          api.get(`/digest/${user.id}`),
          api.get('/news/all'),
        ]);
        setDigest(digestRes.data);
        setNews(newsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  if (loading) return <div className="card">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <div className="card">
        <h2>Today’s Digest</h2>
        {digest ? (
          <>
            <div className="muted">
              {digest.date ? new Date(digest.date).toLocaleString() : ''}
            </div>
            {digest.summaryText && (
              <pre className="prewrap">{digest.summaryText}</pre>
            )}
            <h3>Articles</h3>
            <ul className="list">
              {digest.articles.map((a) => (
                <li key={a._id || a.url}>
                  <div className="list-title">{a.title}</div>
                  {a.summary && <pre className="prewrap muted">{a.summary}</pre>}
                  {a.url && (
                    <a href={a.url} target="_blank" rel="noreferrer">
                      Read source
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="muted">
            No digest found yet. It will be generated at 8 PM, or seed demo data to
            see one immediately.
          </div>
        )}
      </div>

      <div className="card">
        <h2>Latest News Summaries</h2>
        <ul className="list">
          {news.slice(0, 20).map((a) => (
            <li key={a._id || a.url}>
              <div className="pill">{a.category || 'General'}</div>
              <div className="list-title">{a.title}</div>
              {a.summary ? (
                <pre className="prewrap muted">{a.summary}</pre>
              ) : (
                <div className="muted">No summary yet</div>
              )}
              {a.url && (
                <a href={a.url} target="_blank" rel="noreferrer">
                  Read source
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;

