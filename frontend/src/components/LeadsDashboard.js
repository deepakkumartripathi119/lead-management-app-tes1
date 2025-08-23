import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import LeadModal from './LeadModal';
import DeleteModal from './DeleteModal';
import FilterPanel from './FilterPanel';

const API_URL = process.env.REACT_APP_API_URL;

export default function LeadsDashboard({ user, onLogout }) {
  const gridRef = useRef();
  const [rowData, setRowData] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });
  
  // Comprehensive filters with operators
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

  // Build query parameters for server-side filtering
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

  const fetchLeads = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      // Add filter parameters
      const filterParams = buildFilterParams();
      filterParams.forEach((value, key) => {
        queryParams.append(key, value);
      });

      const response = await fetch(`${API_URL}/leads?${queryParams}`, {
        credentials: 'include' // httpOnly cookies
      });

      if (response.status === 401) {
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      setRowData(data.data || data.leads || []);
      setPagination({
        total: data.total || data.totalLeads || 0,
        page: data.page || data.currentPage || page,
        limit: data.limit || 20,
        totalPages: data.totalPages || Math.ceil((data.total || 0) / (data.limit || 20))
      });
    } catch (error) {
      console.error("Fetch leads error:", error);
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, onLogout, buildFilterParams]);

  useEffect(() => {
    fetchLeads(1);
  }, [fetchLeads]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    fetchLeads(1); // Reset to first page when applying filters
  };

  const handleClearFilters = () => {
    fetchLeads(1); // Refetch with cleared filters
  };

  const handleSaveLead = () => {
    setIsLeadModalOpen(false);
    setEditingLead(null);
    fetchLeads(pagination.page);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;

    try {
      const response = await fetch(`${API_URL}/leads/${leadToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.status === 401) {
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsDeleteModalOpen(false);
      setLeadToDelete(null);
      fetchLeads(pagination.page);
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
          style={{ color: 'var(--color-error)' }}
        >
          Del
        </button>
      </div>
    );
  };

  const StatusCellRenderer = (params) => {
    if (!params.value) return <span>-</span>;
    const statusClass = `status status--${
      params.value === 'new' ? 'info' : 
      params.value === 'won' ? 'success' : 
      params.value === 'lost' ? 'error' : 
      'warning'
    }`;
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
  const columnDefs = [
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
    fetchLeads(newPage);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1>Lead Management System</h1>
          <div className="header-actions">
            <span className="user-email">{user?.email}</span>
            <button className="btn btn--secondary" onClick={onLogout}>
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