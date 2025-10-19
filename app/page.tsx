'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper } from '@/types/paper';

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'all' | 'not-reviewed' | 'in-progress' | 'reviewed'>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    year: '',
    link: '',
    addedBy: '',
    notes: '',
  });

  useEffect(() => {
    fetchPapers();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredPapers(papers);
    } else {
      setFilteredPapers(papers.filter(paper => paper.status === filter));
    }
  }, [papers, filter]);

  const fetchPapers = async () => {
    try {
      const response = await axios.get('/api/papers');
      setPapers(response.data.data);
      setLoading(false);
    } catch (err: any) {
      setError('Failed to fetch papers');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.addedBy) {
      setError('Your name is required');
      return;
    }

    if (!formData.title && !formData.link) {
      setError('Either paper title or link is required');
      return;
    }

    setLoading(true);
    setError(''); // Clear any previous errors
    setSuccess(''); // Clear any previous success messages
    
    try {
      const response = await axios.post('/api/papers', formData);
      
      if (response.data.extracted) {
        setSuccess('✅ Paper added successfully! (Data automatically extracted and summarized)');
      } else {
        setSuccess('✅ Paper added successfully!');
      }
      
      setFormData({
        title: '',
        authors: '',
        year: '',
        link: '',
        addedBy: '',
        notes: '',
      });
      fetchPapers();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setSuccess(''); // Clear the processing message
      const errorMsg = err.response?.data?.error || 'Failed to add paper';
      if (err.response?.data?.isDuplicate) {
        setError(errorMsg); // Already has 🔍 emoji - stays until next submission
      } else {
        setError(errorMsg);
        setTimeout(() => setError(''), 10000);
      }
    } finally {
      setLoading(false);
    }
  };



  const updatePaperStatus = async (
    id: string,
    status: 'not-reviewed' | 'in-progress' | 'reviewed',
    reviewedBy?: string
  ) => {
    try {
      await axios.patch(`/api/papers/${id}`, { status, reviewedBy });
      fetchPapers();
    } catch (err) {
      setError('Failed to update paper');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deletePaper = async (id: string) => {
    if (!confirm('Are you sure you want to delete this paper?')) return;
    
    try {
      await axios.delete(`/api/papers/${id}`);
      fetchPapers();
      setSuccess('Paper deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete paper');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading papers...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>📚 Literature Survey Tracker</h1>
        <p>Collaborate on research paper reviews with your team</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="add-paper-form">
        <h2>Add New Paper</h2>
        <p style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
          🤖 <strong>Smart Mode:</strong> Just paste the paper URL! We'll automatically extract title, authors, abstract, and generate a summary.
          <br />
          <small>✅ Works with: ArXiv, IEEE, CEUR-WS, Springer, ScienceDirect, DOI links. Some sites (ACM, Google Scholar) may require manual entry due to anti-scraping protection.</small>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Paper Link/URL (Recommended) 🔗</label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://arxiv.org/abs/... or https://doi.org/..."
            />
            <small style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Supports: ArXiv, IEEE, ACM, Springer, ScienceDirect, DOI links, Google Scholar
            </small>
          </div>

          <div style={{ textAlign: 'center', margin: '1rem 0', color: '#94a3b8' }}>
            — OR enter manually —
          </div>

          <div className="form-group">
            <label>Paper Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter paper title (auto-filled if URL provided)"
            />
          </div>

          <div className="form-group">
            <label>Authors (Optional)</label>
            <input
              type="text"
              value={formData.authors}
              onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
              placeholder="Auto-filled from URL if available"
            />
          </div>

          <div className="form-group">
            <label>Year (Optional)</label>
            <input
              type="text"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="Auto-filled from URL if available"
            />
          </div>

          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              value={formData.addedBy}
              onChange={(e) => setFormData({ ...formData, addedBy: e.target.value })}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add extra notes (AI summary will be auto-generated)"
            />
          </div>

          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              value={formData.addedBy}
              onChange={(e) => setFormData({ ...formData, addedBy: e.target.value })}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '🔄 Processing (Extracting → Checking → Summarizing)...' : '➕ Add Paper (Auto-Extract & Summarize)'}
            </button>
          </div>
        </form>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({papers.length})
        </button>
        <button
          className={`filter-btn ${filter === 'not-reviewed' ? 'active' : ''}`}
          onClick={() => setFilter('not-reviewed')}
        >
          Not Reviewed ({papers.filter(p => p.status === 'not-reviewed').length})
        </button>
        <button
          className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
          onClick={() => setFilter('in-progress')}
        >
          In Progress ({papers.filter(p => p.status === 'in-progress').length})
        </button>
        <button
          className={`filter-btn ${filter === 'reviewed' ? 'active' : ''}`}
          onClick={() => setFilter('reviewed')}
        >
          Reviewed ({papers.filter(p => p.status === 'reviewed').length})
        </button>
      </div>

      {filteredPapers.length === 0 ? (
        <div className="empty-state">
          <h3>No papers found</h3>
          <p>Add your first paper to get started!</p>
        </div>
      ) : (
        <div className="papers-grid">
          {filteredPapers.map((paper) => (
            <div key={paper._id?.toString()} className="paper-card">
              <h3 className="paper-title">{paper.title}</h3>
              
              {paper.authors && (
                <div className="paper-meta">Authors: {paper.authors}</div>
              )}
              
              {paper.year && (
                <div className="paper-meta">Year: {paper.year}</div>
              )}
              
              {paper.link && (
                <div className="paper-meta">
                  <a href={paper.link} target="_blank" rel="noopener noreferrer" className="paper-link">
                    🔗 View Paper
                  </a>
                </div>
              )}

              <div className="paper-meta">
                Added by: {paper.addedBy} on {new Date(paper.addedAt).toLocaleDateString()}
              </div>

              <span className={`paper-status status-${paper.status}`}>
                {paper.status === 'not-reviewed' && '⏳ Not Reviewed'}
                {paper.status === 'in-progress' && '🔄 In Progress'}
                {paper.status === 'reviewed' && '✅ Reviewed'}
              </span>

              {paper.reviewedBy && (
                <div className="paper-meta">
                  Reviewed by: {paper.reviewedBy}
                </div>
              )}

              {paper.summary && (
                <div className="paper-summary">
                  <strong>📝 AI Summary:</strong>
                  <div>{paper.summary}</div>
                </div>
              )}

              {paper.notes && paper.notes !== paper.summary && (
                <div className="paper-summary">
                  <strong>📌 Additional Notes:</strong>
                  <div>{paper.notes}</div>
                </div>
              )}

              <div className="paper-actions">
                {paper.status !== 'in-progress' && (
                  <button
                    onClick={() => {
                      const name = prompt('Enter your name:');
                      if (name) updatePaperStatus(paper._id!.toString(), 'in-progress', name);
                    }}
                    className="btn btn-sm btn-warning"
                  >
                    📖 Start Review
                  </button>
                )}
                
                {paper.status !== 'reviewed' && (
                  <button
                    onClick={() => {
                      const name = prompt('Enter your name:');
                      if (name) updatePaperStatus(paper._id!.toString(), 'reviewed', name);
                    }}
                    className="btn btn-sm btn-success"
                  >
                    ✅ Mark Reviewed
                  </button>
                )}
                
                {paper.status !== 'not-reviewed' && (
                  <button
                    onClick={() => updatePaperStatus(paper._id!.toString(), 'not-reviewed')}
                    className="btn btn-sm btn-secondary"
                  >
                    ↩️ Reset
                  </button>
                )}
                
                <button
                  onClick={() => deletePaper(paper._id!.toString())}
                  className="btn btn-sm btn-danger"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
