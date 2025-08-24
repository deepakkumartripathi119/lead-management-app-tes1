import React, { useState } from 'react';


const FilterPanel = ({ filters, onFiltersChange, onApplyFilters, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  function handleFilterChange(field, operator, value) {
    setLocalFilters(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [operator]: value
      }
    }));
  }

  function handleApply() {
    onFiltersChange(localFilters);
    onApplyFilters();
  }

  function handleClear() {
    const cleared = {
      email: { equals: '', contains: '' },
      company: { equals: '', contains: '' },
      city: { equals: '', contains: '' },
      first_name: { equals: '', contains: '' },
      last_name: { equals: '', contains: '' },
      status: { equals: '', in: [] },
      source: { equals: '', in: [] },
      score: { equals: '', gt: '', lt: '', between_min: '', between_max: '' },
      lead_value: { equals: '', gt: '', lt: '', between_min: '', between_max: '' },
      created_at: { on: '', before: '', after: '', between_start: '', between_end: '' },
      last_activity_at: { on: '', before: '', after: '', between_start: '', between_end: '' },
      is_qualified: { equals: '' }
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
    onClearFilters();
  }

  return (
    <div className="filters-panel">
      <div className="filters-header">
        <h3>Advanced Filters</h3>
        <div className="filter-actions">
          <button className="btn btn--primary btn--sm" onClick={handleApply}>
            Apply Filters
          </button>
          <button className="btn btn--secondary btn--sm" onClick={handleClear}>
            Clear All
          </button>
        </div>
      </div>

      <div className="filters-grid">
        {/* String Fields */}
        <div className="filter-group">
          <label className="form-label">Email</label>
          <div className="filter-operators">
            <select
              className="form-control filter-operator"
              value={localFilters.email?.equals || ''}
              onChange={(e) => handleFilterChange('email', 'equals', e.target.value)}
            >
              <option value="">Equals...</option>
            </select>
            <input
              type="email"
              placeholder="Exact email"
              className="form-control"
              value={localFilters.email?.equals || ''}
              onChange={(e) => handleFilterChange('email', 'equals', e.target.value)}
            />
          </div>
          <input
            type="email"
            placeholder="Contains text..."
            className="form-control"
            value={localFilters.email?.contains || ''}
            onChange={(e) => handleFilterChange('email', 'contains', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="form-label">Company</label>
          <input
            type="text"
            placeholder="Exact company name"
            className="form-control"
            value={localFilters.company?.equals || ''}
            onChange={(e) => handleFilterChange('company', 'equals', e.target.value)}
          />
          <input
            type="text"
            placeholder="Contains text..."
            className="form-control"
            value={localFilters.company?.contains || ''}
            onChange={(e) => handleFilterChange('company', 'contains', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="form-label">City</label>
          <input
            type="text"
            placeholder="Exact city name"
            className="form-control"
            value={localFilters.city?.equals || ''}
            onChange={(e) => handleFilterChange('city', 'equals', e.target.value)}
          />
          <input
            type="text"
            placeholder="Contains text..."
            className="form-control"
            value={localFilters.city?.contains || ''}
            onChange={(e) => handleFilterChange('city', 'contains', e.target.value)}
          />
        </div>

        {/* Enum Fields */}
        <div className="filter-group">
          <label className="form-label">Status</label>
          <select
            className="form-control"
            value={localFilters.status?.equals || ''}
            onChange={(e) => handleFilterChange('status', 'equals', e.target.value)}
          >
            <option value="">Any Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="lost">Lost</option>
            <option value="won">Won</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="form-label">Source</label>
          <select
            className="form-control"
            value={localFilters.source?.equals || ''}
            onChange={(e) => handleFilterChange('source', 'equals', e.target.value)}
          >
            <option value="">Any Source</option>
            <option value="website">Website</option>
            <option value="facebook_ads">Facebook Ads</option>
            <option value="google_ads">Google Ads</option>
            <option value="referral">Referral</option>
            <option value="events">Events</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Number Fields */}
        <div className="filter-group">
          <label className="form-label">Score</label>
          <div className="number-filters">
            <input
              type="number"
              placeholder="Equals"
              className="form-control"
              min="0"
              max="100"
              value={localFilters.score?.equals || ''}
              onChange={(e) => handleFilterChange('score', 'equals', e.target.value)}
            />
            <div className="range-filters">
              <input
                type="number"
                placeholder="Min"
                className="form-control"
                min="0"
                max="100"
                value={localFilters.score?.gt || ''}
                onChange={(e) => handleFilterChange('score', 'gt', e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                className="form-control"
                min="0"
                max="100"
                value={localFilters.score?.lt || ''}
                onChange={(e) => handleFilterChange('score', 'lt', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="filter-group">
          <label className="form-label">Lead Value</label>
          <div className="number-filters">
            <input
              type="number"
              placeholder="Equals"
              className="form-control"
              min="0"
              step="0.01"
              value={localFilters.lead_value?.equals || ''}
              onChange={(e) => handleFilterChange('lead_value', 'equals', e.target.value)}
            />
            <div className="range-filters">
              <input
                type="number"
                placeholder="Min"
                className="form-control"
                min="0"
                step="0.01"
                value={localFilters.lead_value?.gt || ''}
                onChange={(e) => handleFilterChange('lead_value', 'gt', e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                className="form-control"
                min="0"
                step="0.01"
                value={localFilters.lead_value?.lt || ''}
                onChange={(e) => handleFilterChange('lead_value', 'lt', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Date Fields */}
        <div className="filter-group">
          <label className="form-label">Created Date</label>
          <div className="date-filters">
            <input
              type="date"
              placeholder="On date"
              className="form-control"
              value={localFilters.created_at?.on || ''}
              onChange={(e) => handleFilterChange('created_at', 'on', e.target.value)}
            />
            <input
              type="date"
              placeholder="After date"
              className="form-control"
              value={localFilters.created_at?.after || ''}
              onChange={(e) => handleFilterChange('created_at', 'after', e.target.value)}
            />
            <input
              type="date"
              placeholder="Before date"
              className="form-control"
              value={localFilters.created_at?.before || ''}
              onChange={(e) => handleFilterChange('created_at', 'before', e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label className="form-label">Last Activity</label>
          <div className="date-filters">
            <input
              type="date"
              placeholder="On date"
              className="form-control"
              value={localFilters.last_activity_at?.on || ''}
              onChange={(e) => handleFilterChange('last_activity_at', 'on', e.target.value)}
            />
            <input
              type="date"
              placeholder="After date"
              className="form-control"
              value={localFilters.last_activity_at?.after || ''}
              onChange={(e) => handleFilterChange('last_activity_at', 'after', e.target.value)}
            />
            <input
              type="date"
              placeholder="Before date"
              className="form-control"
              value={localFilters.last_activity_at?.before || ''}
              onChange={(e) => handleFilterChange('last_activity_at', 'before', e.target.value)}
            />
          </div>
        </div>

        {/* Boolean Field */}
        <div className="filter-group">
          <label className="form-label">Is Qualified</label>
          <select
            className="form-control"
            value={localFilters.is_qualified?.equals || ''}
            onChange={(e) => handleFilterChange('is_qualified', 'equals', e.target.value)}
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;