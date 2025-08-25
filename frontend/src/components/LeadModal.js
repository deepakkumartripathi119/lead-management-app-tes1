import React, { useState, useEffect } from "react";
const PORT = (process.env.REACT_APP_URL_CHECK==='localhost')?5001:5000;
const API_URL =
  process.env.REACT_APP_URL_CHECK==='localhost'
    ? `http://localhost:${PORT}/api`
    : process.env.REACT_APP_API_URL;

export default function LeadModal({ isOpen, onClose, onSave, lead, token,onLogout }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const initialState = {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      city: "",
      state: "",
      source: "",
      status: "new",
      score: 0,
      lead_value: 0,
      is_qualified: false,
    };
    setFormData(lead ? { ...initialState, ...lead } : initialState);
  }, [lead]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const url = lead ? `${API_URL}/leads/${lead._id}` : `${API_URL}/leads`;
    const method = lead ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          onLogout && onLogout();
          return;
        }
        throw new Error(data.message || "Failed to save lead");
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{lead ? "Edit Lead" : "Create New Lead"}</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <p className="error-message">{error}</p>}

            {/* --- Name --- */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="firstName">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="first_name"
                  className="form-control"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lastName">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="last_name"
                  className="form-control"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* --- Contact Info --- */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control"
            
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* --- Company & Location --- */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="company">
                  Company *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="form-control"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="city">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="form-control"
            
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* --- State & Source --- */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="state">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  className="form-control"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="source">
                  Source *
                </label>
                <select
                  id="source"
                  name="source"
                  className="form-control"
                  value={formData.source}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Source</option>
                  <option value="website">Website</option>
                  <option value="facebook_ads">Facebook Ads</option>
                  <option value="google_ads">Google Ads</option>
                  <option value="referral">Referral</option>
            
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* --- Status & Score --- */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="status">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="lost">Lost</option>
                  <option value="won">Won</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="score">
                  Score (0-100) *
                </label>
                <input
                  type="number"
                  id="score"
                  name="score"
                  className="form-control"
                  min="0"
                  max="100"
            
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* --- Value & Qualification --- */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="leadValue">
                  Lead Value ($) *
                </label>
                <input
                  type="number"
                  id="leadValue"
                  name="lead_value"
                  className="form-control"
                  min="0"
                  step="0.01"
                  value={formData.lead_value}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Qualification *</label>
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="isQualified"
                    name="is_qualified"
                    className="checkbox"
                    checked={formData.is_qualified}
                    onChange={handleChange}
                  />
                  <label htmlFor="isQualified">Mark as qualified</label>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn--outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
