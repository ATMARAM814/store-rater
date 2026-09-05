import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { IconStore } from '../../components/Icons';

export default function AddStore() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gstin: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      newErrors.name = 'Store name must be between 20 and 60 characters.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid business email address.';
    }

    const cleanGstin = formData.gstin.trim().toUpperCase();
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[A-Z0-9]{1}[0-9A-Z]{1}$/i;
    if (cleanGstin && !gstinRegex.test(cleanGstin)) {
      newErrors.gstin = 'Invalid GSTIN. Must be 15 characters (e.g. 27AAPFU0939F1ZV).';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Store physical address is required.';
    } else if (formData.address.trim().length < 20) {
      newErrors.address = 'Store address must be at least 20 characters.';
    } else if (formData.address.trim().length > 400) {
      newErrors.address = 'Store address must not exceed 400 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const cleanGstin = formData.gstin.trim().toUpperCase();
      const finalAddress = cleanGstin
        ? `${formData.address.trim()} (GSTIN: ${cleanGstin})`
        : formData.address.trim();

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: finalAddress,
        gstin: cleanGstin || undefined,
      };

      await API.post('/stores', payload);
      navigate('/admin/stores');
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        const fieldErrors = {};
        errorData.errors.forEach((errItem) => {
          fieldErrors[errItem.path] = errItem.msg;
        });
        setErrors(fieldErrors);
      } else {
        setServerError(errorData?.error || 'Failed to create store listing.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Register New Store Listing</h1>
        <p>Add a verified commercial store with official physical address and linked owner</p>
      </div>

      <div className="card" style={{ padding: 'var(--space-2xl)' }}>
        {serverError && <div className="alert alert-error">⚠️ {serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="store-name">Store Name</label>
            <input
              id="store-name"
              type="text"
              className="form-input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter official store name (min 20 characters)"
            />
            <span className="form-hint">{formData.name.length}/60 characters (min 20)</span>
            {errors.name && <div className="form-error">⚠️ {errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="store-email">Store Contact Email</label>
            <input
              id="store-email"
              type="email"
              className="form-input"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="store@example.com"
            />
            {errors.email && <div className="form-error">⚠️ {errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="store-gstin">GSTIN Number (15 Characters - Optional)</label>
            <input
              id="store-gstin"
              type="text"
              className="form-input"
              name="gstin"
              maxLength={15}
              value={formData.gstin}
              onChange={handleChange}
              placeholder="e.g. 27AAPFU0939F1ZV"
              style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
            <span className="form-hint">Official 15-character Indian GSTIN for tax & legal verification</span>
            {errors.gstin && <div className="form-error">⚠️ {errors.gstin}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="store-address">Store Physical Address</label>
            <textarea
              id="store-address"
              className="form-textarea"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Shop number, building, street, locality, landmark, city, state, pincode (min 20 characters)"
              rows={3}
            />
            <span className="form-hint">{formData.address.length}/400 characters (min 20)</span>
            {errors.address && <div className="form-error">⚠️ {errors.address}</div>}
          </div>

          <div className="flex gap-md" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/stores')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '150px' }}>
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
