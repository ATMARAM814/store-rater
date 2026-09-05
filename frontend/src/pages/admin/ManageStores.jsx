import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import RatingStars from '../../components/RatingStars';
import { IconDownload, IconPlus, IconStore, IconCheckCircle } from '../../components/Icons';

export default function ManageStores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchStores();
  }, [filters, sortBy, sortOrder]);

  const fetchStores = async () => {
    try {
      const params = { ...filters, sortBy, sortOrder };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });
      const res = await API.get('/stores', { params });
      setStores(res.data);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Export CSV
  const handleExportCSV = () => {
    if (stores.length === 0) return;
    const headers = ['ID,Store Name,Email,Address,Overall Rating,Total Ratings\n'];
    const rows = stores.map(s => 
      `"${s.id}","${s.name}","${s.email}","${s.address.replace(/"/g, '""')}","${s.overallRating || 0}","${s.totalRatings || 0}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `storerater-stores-${new Date().toISOString().slice(0, 10)}.csv`);
    a.click();
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1>Registered Stores Directory</h1>
            <p>Monitor all registered business listings, verified physical addresses, and community ratings</p>
          </div>
          <div className="flex gap-sm">
            <button type="button" className="btn btn-secondary" onClick={handleExportCSV}>
              <IconDownload size={14} color="#166534" /> Export CSV
            </button>
            <Link to="/admin/stores/add" className="btn btn-primary">
              <IconPlus size={14} color="#FFFFFF" /> Add New Store
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-md) var(--space-lg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.5fr', gap: 'var(--space-md)' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Filter by store name..."
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Filter by store email..."
            name="email"
            value={filters.email}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Filter by store address..."
            name="address"
            value={filters.address}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <div className="stat-icon" style={{ margin: '0 auto var(--space-md)' }}>
            <IconStore size={24} color="#166534" />
          </div>
          <h3>No stores found</h3>
          <p>Try adjusting your search criteria or register a new store.</p>
          <button
            className="btn btn-secondary mt-md"
            onClick={() => setFilters({ name: '', email: '', address: '' })}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className={sortBy === 'name' ? 'sorted' : ''}>
                  Store Name <span className="sort-icon">{getSortIcon('name')}</span>
                </th>
                <th onClick={() => handleSort('email')} className={sortBy === 'email' ? 'sorted' : ''}>
                  Store Email <span className="sort-icon">{getSortIcon('email')}</span>
                </th>
                <th onClick={() => handleSort('address')} className={sortBy === 'address' ? 'sorted' : ''}>
                  Physical Address <span className="sort-icon">{getSortIcon('address')}</span>
                </th>
                <th>Community Rating</th>
                <th>Total Reviews</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr
                  key={store.id}
                  className="clickable-row"
                  onClick={() => navigate(`/stores/${store.id}`)}
                  title="Click to view detailed store audit trail and ratings"
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="user-avatar" style={{ width: '32px', height: '32px' }}>
                        <IconStore size={16} color="#166534" />
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {store.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{store.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {store.address}
                  </td>
                  <td>
                    <div className="star-rating-display">
                      <RatingStars value={Math.round(store.overallRating || 0)} readonly size="sm" />
                      <span className="rating-value" style={{ marginLeft: '4px' }}>
                        {store.overallRating ? store.overallRating.toFixed(1) : 'New'}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {store.totalRatings || 0}
                  </td>
                  <td>
                    <span className="verified-pill">
                      <IconCheckCircle size={12} color="#166534" />
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
