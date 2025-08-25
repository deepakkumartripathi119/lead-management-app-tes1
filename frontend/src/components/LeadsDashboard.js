import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import LeadModal from './LeadModal';
import DeleteModal from './DeleteModal';
import FilterPanel from './FilterPanel';

const PORT = (process.env.REACT_APP_URL_CHECK==='localhost')?5001:5000;
const API_URL =
  process.env.REACT_APP_URL_CHECK==='localhost'
    ? `http://localhost:${PORT}/api`
    : process.env.REACT_APP_API_URL;

export default function LeadsDashboard({ user, onLogout }) {
  const gridRef = useRef();
  const [rowData, setRowData] = useState([]);
  const [allLeads, setAllLeads] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });
  
  const [filters, setFilters] = useState({
    // String fields with equals/contains
    email: { equals: '', contains: '' },
    company: { equals: '', contains: '' },
    city: { equals: '', contains: '' },
    first_name: { equals: '', contains: '' },
    last_name: { equals: '', contains: '' },
    
    // Enum fields with equals/in
    status: { equals: '', in: [] },
    source: { equals: '', in: [] },
    
    // Number fields with equals/gt/lt/between
    score: { equals: '', gt: '', lt: '', between_min: '', between_max: '' },
    lead_value: { equals: '', gt: '', lt: '', between_min: '', between_max: '' },
    
    // Date fields with on/before/after/between
    created_at: { on: '', before: '', after: '', between_start: '', between_end: '' },
    last_activity_at: { on: '', before: '', after: '', between_start: '', between_end: '' },
    
    // Boolean field
    is_qualified: { equals: '' }
  });
  
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const buildFilterParams = useCallback(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([field, operators]) => {
      Object.entries(operators).forEach(([operator, value]) => {
        if (value && value.toString().trim() !== '' && JSON.stringify(value) !== '[]') {
          // Handle different value types
          if (Array.isArray(value) && value.length > 0) {
            // For 'in' operator with arrays
            params.append(`${field}[${operator}]`, value.join(','));
          } else if (value === 'true' || value === 'false') {
            // For boolean values
            params.append(`${field}[${operator}]`, value);
          } else if (typeof value === 'string' && value.trim() !== '') {
            // For string values
            params.append(`${field}[${operator}]`, value.trim());
          } else if (typeof value === 'number' || !isNaN(Number(value))) {
            // For numeric values
            params.append(`${field}[${operator}]`, value);
          }
        }
      });
    });
    
    return params;
  }, [filters]);


  const fetchAllLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/leads?page=1&limit=10000`, {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          onLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
     
      const leads = data.data || data.leads || [];
      setAllLeads(leads);
      setRowData(leads);
      setPagination({
        total: leads.length,
        page: 1,
        limit: pagination.limit,
        totalPages: Math.ceil(leads.length / pagination.limit)
      });
    } catch (error) {
      console.error("Fetch leads error:", error);
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [onLogout, pagination.limit]);

  const applyFrontendFilters = useCallback(() => {
    let filtered = allLeads;
    Object.entries(filters).forEach(([field, ops]) => {
      Object.entries(ops).forEach(([op, value]) => {
        if (value === '' || value === undefined || value === null || (Array.isArray(value) && value.length === 0)) return;
        // String fields
        if (["email","company","city","first_name","last_name"].includes(field)) {
          if (op === 'equals') filtered = filtered.filter(l => (l[field] || '') === value);
          if (op === 'contains') filtered = filtered.filter(l => (l[field] || '').toLowerCase().includes(value.toLowerCase()));
        }
        // Enum fields
        if (["status","source"].includes(field)) {
          if (op === 'equals') filtered = filtered.filter(l => l[field] === value);
          if (op === 'in') filtered = filtered.filter(l => Array.isArray(value) ? value.includes(l[field]) : (value || '').split(',').includes(l[field]));
        }
        // Number fields
        if (["score","lead_value"].includes(field)) {
          const num = l => Number(l[field]);
          if (op === 'equals') filtered = filtered.filter(l => num(l) === Number(value));
          if (op === 'gt') filtered = filtered.filter(l => num(l) > Number(value));
          if (op === 'lt') filtered = filtered.filter(l => num(l) < Number(value));
          if (op === 'between') {
            const min = Number(ops.between_min);
            const max = Number(ops.between_max);
            if (!isNaN(min) && !isNaN(max)) filtered = filtered.filter(l => num(l) >= min && num(l) <= max);
          }
        }
        // Date fields
        if (["created_at","last_activity_at"].includes(field)) {
          const dateVal = l => new Date(l[field]);
          if (op === 'on') {
            const d = new Date(value);
            filtered = filtered.filter(l => {
              const dt = dateVal(l);
              return dt.toDateString() === d.toDateString();
            });
          }
          if (op === 'before') filtered = filtered.filter(l => dateVal(l) < new Date(value));
          if (op === 'after') filtered = filtered.filter(l => dateVal(l) > new Date(value));
          if (op === 'between') {
            const start = new Date(ops.between_start);
            const end = new Date(ops.between_end);
            filtered = filtered.filter(l => dateVal(l) >= start && dateVal(l) <= end);
          }
        }
        // Boolean field
        if (field === 'is_qualified' && op === 'equals') {
          filtered = filtered.filter(l => String(l[field]) === String(value));
        }
      });
    });
    // PAGINATION: Only show current page's leads
    setPagination(p => {
      const total = filtered.length;
      const totalPages = Math.ceil(total / p.limit) || 1;
      let page = p.page;
      if (page > totalPages) page = totalPages;
      if (page < 1) page = 1;
      const startIdx = (page - 1) * p.limit;
      const endIdx = startIdx + p.limit;
      setRowData(filtered.slice(startIdx, endIdx));
      return { ...p, total, totalPages, page };
    });
  }, [allLeads, filters]);


  useEffect(() => {
    fetchAllLeads();
  }, [fetchAllLeads]);

  useEffect(() => {
    applyFrontendFilters();
  }, [filters, allLeads, applyFrontendFilters, pagination.page, pagination.limit]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
  setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
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
    });
  };

  const handleSaveLead = () => {
    setIsLeadModalOpen(false);
    setEditingLead(null);
    fetchAllLeads();
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    try {
      const response = await fetch(`${API_URL}/leads/${leadToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          onLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setIsDeleteModalOpen(false);
      setLeadToDelete(null);
      fetchAllLeads();
    } catch (error) {
      console.error("Delete error:", error);
      if (error.message.includes('401')) {
        onLogout();
      }
    }
  };

  const ActionCellRenderer = (params) => {
    const onEdit = () => {
      setEditingLead(params.data);
      setIsLeadModalOpen(true);
    };

    const onDelete = () => {
      setLeadToDelete(params.data);
      setIsDeleteModalOpen(true);
    };

    return (
      <div className="action-buttons">
        <button 
          className="btn btn--sm btn--secondary" 
          onClick={onEdit}
          title="Edit Lead"
        >
          Edit
        </button>
        <button 
          className="btn btn--sm btn--outline" 
          onClick={onDelete}
          title="Delete Lead"
          style={{ color: 'var(--color-red-500)' }}
        >
          Del
        </button>
      </div>
    );
  };

  const statusColorMap = {
    new: 'info',
    contacted: 'contacted',
    qualified: 'qualified',
    proposal: 'proposal',
    won: 'success',
    lost: 'error',
    followup: 'followup',
    unqualified: 'unqualified',
    // fallback
    default: 'warning',
  };
  const StatusCellRenderer = (params) => {
    if (!params.value) return <span>-</span>;
    const key = params.value.toLowerCase();
    const colorClass = statusColorMap[key] || statusColorMap.default;
    const statusClass = `status status--${colorClass}`;
    return <span className={statusClass}>{params.value}</span>;
  };

  const BooleanCellRenderer = (params) => {
    return <span>{params.value ? '✅' : '❌'}</span>;
  };

  const DateCellRenderer = (params) => {
    if (!params.value) return <span>-</span>;
    const date = new Date(params.value);
    return <span>{date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit' 
    })}</span>;
  };

  const CurrencyCellRenderer = (params) => {
    if (!params.value && params.value !== 0) return <span>$0</span>;
    const value = Number(params.value);
    if (value >= 1000) {
      return <span>${(value / 1000).toFixed(1)}k</span>;
    }
    return <span>${value}</span>;
  };

  // Narrower column definitions to fit all columns on screen
  const SerialCellRenderer = (params) => {
    // Calculate serial number based on page and index
    const { pagination } = params.context;
    return (
      <span>{((pagination.page - 1) * pagination.limit) + (params.rowIndex + 1)}</span>
    );
  };

  const columnDefs = [
    { headerName: 'S.No.', width: 60, cellRenderer: SerialCellRenderer, sortable: false, filter: false },
    { headerName: 'First', field: 'first_name', sortable: true, filter: false, width: 80 },
    { headerName: 'Last', field: 'last_name', sortable: true, filter: false, width: 80 },
    { headerName: 'Email', field: 'email', sortable: true, filter: false, width: 150 },
    { headerName: 'Phone', field: 'phone', sortable: true, filter: false, width: 100 },
    { headerName: 'Company', field: 'company', sortable: true, filter: false, width: 100 },
    { headerName: 'City', field: 'city', sortable: true, filter: false, width: 70 },
    { headerName: 'State', field: 'state', sortable: true, filter: false, width: 50 },
    { headerName: 'Source', field: 'source', sortable: true, filter: false, width: 80 },
    { headerName: 'Status', field: 'status', sortable: true, filter: false, cellRenderer: StatusCellRenderer, width: 70 },
    { headerName: 'Score', field: 'score', sortable: true, filter: false, width: 60 },
    { headerName: 'Value', field: 'lead_value', sortable: true, filter: false, cellRenderer: CurrencyCellRenderer, width: 70 },
    { headerName: 'Qual', field: 'is_qualified', sortable: true, filter: false, cellRenderer: BooleanCellRenderer, width: 50 },
    { headerName: 'Created', field: 'created_at', sortable: true, filter: false, cellRenderer: DateCellRenderer, width: 80 },
    { headerName: 'Activity', field: 'last_activity_at', sortable: true, filter: false, cellRenderer: DateCellRenderer, width: 80 },
    { headerName: 'Actions', cellRenderer: ActionCellRenderer, width: 110, sortable: false, filter: false, pinned: 'right' }
  ];

  const handlePageChange = (newPage) => {
    setPagination(p => {
      let page = newPage;
      if (page < 1) page = 1;
      if (page > p.totalPages) page = p.totalPages;
      return { ...p, page };
    });
  };

  return (
    <div className="container">
      <header className="header" style={{ background: 'rgba(0,0,0,0.7)', borderBottom: '1px solid #222', padding: '10px 0' }}>
        <div className="header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src={process.env.PUBLIC_URL + '/logo1.png'} alt="Logo" style={{ width: 54, height: 54, verticalAlign: 'middle' }} />
            <h1 style={{ margin: 0, color: '#2196F3', fontWeight: 700 }}>ManageLeads</h1>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="user-email" style={{ color: '#fff', fontWeight: 500 }}>{user?.email}</span>
            <button
              className="btn btn--secondary logout-btn"
              style={{
                background: '#FFD600',
                color: '#222',
                border: 'none',
                fontWeight: 700,
                transition: 'background 0.2s, color 0.2s',
                padding: '8px 18px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#FFEA70';
                e.currentTarget.style.color = '#111';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#FFD600';
                e.currentTarget.style.color = '#222';
              }}
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="leads-section">
          <div className="leads-header">
            <h2>Leads ({pagination.total})</h2>
            <div className="header-buttons">
              <button 
                className={`btn btn--outline btn--sm ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
              <button 
                className="btn btn--primary" 
                onClick={() => setIsLeadModalOpen(true)}
              >
                Add New Lead
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="filters-section">
              <FilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />
            </div>
          )}

          <div className="grid-container">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                Loading leads...
              </div>
            ) : (
              <div className="ag-theme-alpine leads-grid">
                <AgGridReact
                  ref={gridRef}
                  columnDefs={columnDefs}
                  rowData={rowData}
                  context={{ pagination }}
                  pagination={false}
                  suppressPaginationPanel={true}
                  defaultColDef={{
                    resizable: true,
                    sortable: true,
                    minWidth: 100
                  }}
                  suppressHorizontalScroll={false}
                  enableColResize={true}
                />
              </div>
            )}
          </div>

          <div className="pagination-container">
            <div className="pagination-info">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} leads
            </div>
            <div className="pagination-controls">
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </button>
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, pagination.page - 2) + i;
                  if (pageNum > pagination.totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      className={`page-number ${pageNum === pagination.page ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          setEditingLead(null);
        }}
        onSave={handleSaveLead}
        lead={editingLead}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setLeadToDelete(null);
        }}
        onConfirm={confirmDeleteLead}
      />
    </div>
  );
}