import React, { useEffect, useState } from 'react';
import api from '../services/api';

function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

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

  if (loading)
    return (
      <div className="card mt-4 text-center text-slate-200">
        Loading dashboard...
      </div>
    );
  if (error) return <div className="error mt-4">{error}</div>;

  const today = new Date();
  const formattedToday = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Build simple category highlights from digest articles
  const highlightByCategory = {};
  if (digest && Array.isArray(digest.articles)) {
    digest.articles.forEach((a) => {
      const cat = a.category || 'General';
      if (!highlightByCategory[cat]) {
        highlightByCategory[cat] = a.summary || a.title;
      }
    });
  }

  const digestHighlights = [
    { key: 'AI', label: 'AI' },
    { key: 'Web Development', label: 'Web Dev' },
    { key: 'Startups', label: 'Startups' },
  ];

  const handleViewFullDigest = () => {
    // For now, scroll down to the digest section or simply rely on the card text.
    // This keeps existing functionality unchanged.
    const el = document.getElementById('digest-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      {/* TOP SECTION – Today’s Digest */}
      <section
        id="digest-section"
        className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6 shadow-lg shadow-slate-900/40 backdrop-blur"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-sky-300">
              <span role="img" aria-label="mail">
                📩
              </span>
              Your Daily News Digest
            </div>
            <h2 className="mt-1 text-2xl font-semibold text-slate-50">
              {formattedToday}
            </h2>
          </div>
          <button
            onClick={handleViewFullDigest}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-900/40 hover:brightness-110"
          >
            View Full Digest
          </button>
        </div>

        {digest ? (
          <>
            <p className="mt-4 text-sm text-slate-300">
              Generated at{' '}
              {digest.date ? new Date(digest.date).toLocaleTimeString() : '--'}
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {digestHighlights.map(({ key, label }) => (
                <div
                  key={key}
                  className="rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {label}
                  </div>
                  <p className="mt-1 text-sm text-slate-200 line-clamp-3">
                    {highlightByCategory[key] || 'No highlight available yet.'}
                  </p>
                </div>
              ))}
            </div>

            {digest.summaryText && (
              <div className="mt-6 rounded-xl bg-slate-950/40 p-4 text-sm text-slate-200 ring-1 ring-slate-800/70">
                <pre className="prewrap">{digest.summaryText}</pre>
              </div>
            )}
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-300">
            No digest found yet. It will be generated automatically at 8 PM once
            there is news matching your interests.
          </p>
        )}
      </section>

      {/* MIDDLE SECTION – Latest News Feed */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-50">
            Latest News Feed
          </h2>
          <p className="text-xs text-slate-400">
            Showing {Math.min(news.length, 20)} of {news.length} articles
          </p>
        </div>

        <div className="space-y-4">
          {news.slice(0, 20).map((article) => (
            <article
              key={article._id || article.url}
              className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5 shadow-md shadow-slate-900/40"
            >
              <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-50">
                  📰 Title: {article.title}
                </h3>
              </header>

              <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span>📌 Category: {article.category || 'General'}</span>
                <span>
                  🕒 Published:{' '}
                  {article.publishedAt ? timeAgo(article.publishedAt) : '—'}
                </span>
              </div>

              <div className="mb-3 text-sm text-slate-200">
                <div className="mb-1 font-semibold text-slate-100">
                  Summary:
                </div>
                {article.summary ? (
                  <pre className="prewrap text-slate-200">
                    {article.summary}
                  </pre>
                ) : (
                  <div className="text-slate-400">No summary yet.</div>
                )}
              </div>

              <footer className="mt-3 flex flex-wrap gap-3 text-sm">
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-sky-500/70 px-3 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-500/10"
                  >
                    🔗 Read Source
                  </a>
                )}
                <button
                  type="button"
                  className="inline-flex cursor-not-allowed items-center justify-center rounded-xl border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 opacity-70"
                  title="Save (not implemented in this demo)"
                >
                  ❤️ Save
                </button>
                <button
                  type="button"
                  className="inline-flex cursor-not-allowed items-center justify-center rounded-xl border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 opacity-70"
                  title="Add to Digest (not implemented in this demo)"
                >
                  📌 Add to Digest
                </button>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

