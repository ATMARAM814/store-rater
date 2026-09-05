import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { IconDownload, IconPlus } from '../../components/Icons';

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchUsers();
  }, [filters, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      const params = { ...filters, sortBy, sortOrder };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });
      const res = await API.get('/users', { params });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
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

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: 'badge-admin',
      USER: 'badge-user',
      STORE_OWNER: 'badge-store-owner',
    };
    return (
      <span className={`badge ${badges[role] || ''}`}>
        {role.replace('_', ' ')}
      </span>
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Export to CSV feature (very real SaaS feature)
  const handleExportCSV = () => {
    if (users.length === 0) return;
    const headers = ['ID,Name,Email,Role,Address,Created At\n'];
    const rows = users.map(u => 
      `"${u.id}","${u.name}","${u.email}","${u.role}","${u.address.replace(/"/g, '""')}","${u.created_at}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `storerater-users-${new Date().toISOString().slice(0, 10)}.csv`);
    a.click();
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1>User Accounts Directory</h1>
            <p>Inspect, filter, sort, and manage all registered accounts on the platform</p>
          </div>
          <div className="flex gap-sm">
            <button type="button" className="btn btn-secondary" onClick={handleExportCSV}>
              <IconDownload size={14} color="#166534" /> Export CSV
            </button>
            <Link to="/admin/users/add" className="btn btn-primary">
              <IconPlus size={14} color="#FFFFFF" /> Add New User
            </Link>
          </div>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="filter-chips">
        <button
          type="button"
          className={`chip-btn ${filters.role === '' ? 'active' : ''}`}
          onClick={() => setFilters(prev => ({ ...prev, role: '' }))}
        >
          All Users ({users.length})
        </button>
        <button
          type="button"
          className={`chip-btn ${filters.role === 'USER' ? 'active' : ''}`}
          onClick={() => setFilters(prev => ({ ...prev, role: 'USER' }))}
        >
          Normal Users
        </button>
        <button
          type="button"
          className={`chip-btn ${filters.role === 'STORE_OWNER' ? 'active' : ''}`}
          onClick={() => setFilters(prev => ({ ...prev, role: 'STORE_OWNER' }))}
        >
          Store Owners
        </button>
      </div>

      {/* Advanced Filter Card */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-md) var(--space-lg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.5fr', gap: 'var(--space-md)' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Filter by user name..."
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Filter by email..."
            name="email"
            value={filters.email}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Filter by address..."
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
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No users match your filters</h3>
          <p>Try resetting your search query or clear the role filters.</p>
          <button
            className="btn btn-secondary mt-md"
            onClick={() => setFilters({ name: '', email: '', address: '', role: '' })}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className={sortBy === 'name' ? 'sorted' : ''}>
                  User Name <span className="sort-icon">{getSortIcon('name')}</span>
                </th>
                <th onClick={() => handleSort('email')} className={sortBy === 'email' ? 'sorted' : ''}>
                  Email Address <span className="sort-icon">{getSortIcon('email')}</span>
                </th>
                <th onClick={() => handleSort('role')} className={sortBy === 'role' ? 'sorted' : ''}>
                  Account Role <span className="sort-icon">{getSortIcon('role')}</span>
                </th>
                <th onClick={() => handleSort('address')} className={sortBy === 'address' ? 'sorted' : ''}>
                  Address <span className="sort-icon">{getSortIcon('address')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="clickable-row"
                  onClick={() => navigate(`/admin/users/${user.id}`)}
                  title="Click anywhere on this row to view user details"
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={`user-avatar ${user.role === 'ADMIN' ? 'admin' : user.role === 'STORE_OWNER' ? 'owner' : ''}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {user.address}
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
