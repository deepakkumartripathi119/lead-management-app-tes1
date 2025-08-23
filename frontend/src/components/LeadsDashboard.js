import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import LeadModal from './LeadModal';
import DeleteModal from './DeleteModal';

const API_URL = process.env.REACT_APP_API_URL;

export default function LeadsDashboard({ user, token, onLogout }) {
    const gridRef = useRef();
    const [rowData, setRowData] = useState([]);
    const [pagination, setPagination] = useState({ totalLeads: 0, currentPage: 1, totalPages: 1 });
    const [filters, setFilters] = useState({ status: '', source: '', company: '' });

    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [leadToDelete, setLeadToDelete] = useState(null);

    const fetchLeads = useCallback(async (page = 1) => {
        try {
            const query = new URLSearchParams({ page, ...filters }).toString();
            const response = await fetch(`${API_URL}/leads?${query}`, {
                headers: { 'Authorization': `Bearer ${token}`,credentials: 'include' }
            });
            if (!response.ok) throw new Error('Failed to fetch leads');
            
            const data = await response.json();
            setRowData(data.leads);
            setPagination({ totalLeads: data.totalLeads, currentPage: data.currentPage, totalPages: data.totalPages });
        } catch (error) {
            console.error("Fetch leads error:", error);
        }
    }, [filters, token]);

    useEffect(() => {
        fetchLeads(1);
    }, [fetchLeads]);

    const handleSaveLead = () => {
        setIsLeadModalOpen(false);
        setEditingLead(null);
        fetchLeads(pagination.currentPage);
    };

    const confirmDeleteLead = async () => {
        if (!leadToDelete) return;
        try {
            const response = await fetch(`${API_URL}/leads/${leadToDelete._id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete lead');
            
            setIsDeleteModalOpen(false);
            setLeadToDelete(null);
            fetchLeads(pagination.currentPage);
        } catch (error) {
            console.error("Delete error:", error);
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
                <button className="btn-action btn-edit" onClick={onEdit}>Edit</button>
                <button className="btn-action btn-delete" onClick={onDelete}>Delete</button>
            </div>
        );
    };

    const columnDefs = [
        { headerName: 'Name', valueGetter: p => `${p.data.first_name} ${p.data.last_name}`, sortable: true, filter: true },
        { field: 'email', sortable: true, filter: true },
        { field: 'company', sortable: true, filter: true },
        { field: 'status', sortable: true, filter: true },
        { field: 'source', sortable: true, filter: true },
        { field: 'lead_value', headerName: 'Value', sortable: true, valueFormatter: p => `$${(p.value || 0).toLocaleString()}` },
        { field: 'createdAt', headerName: 'Created', sortable: true, valueFormatter: p => new Date(p.value).toLocaleDateString() },
        { headerName: 'Actions', cellRenderer: ActionCellRenderer, sortable: false, filter: false }
    ];

    return (
        <div id="main-app" className="main-app">
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <h1>Lead Management System</h1>
                        <div className="header-actions">
                            <span className="user-email">{user.email}</span>
                            <button className="btn btn--outline" onClick={onLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <div className="container">
                    <div className="leads-section">
                        <div className="leads-header">
                            <h2>Leads Dashboard</h2>
                            <button className="btn btn--primary" onClick={() => { setEditingLead(null); setIsLeadModalOpen(true); }}>Create New Lead</button>
                        </div>
                        
                        {/* Filters UI */}
                        <div className="filters-section">
                             {/* ... filter inputs ... */}
                        </div>

                        <div className="grid-container ag-theme-alpine" style={{ height: 600, width: '100%' }}>
                            <AgGridReact
                                ref={gridRef}
                                rowData={rowData}
                                columnDefs={columnDefs}
                                defaultColDef={{ resizable: true }}
                                animateRows={true}
                            />
                        </div>
                        
                        {/* Pagination UI */}
                        <div className="pagination-container">
                             <div className="pagination-info">
                                <span>Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalLeads} leads)</span>
                            </div>
                            <div className="pagination-controls">
                                <button className="btn btn--outline btn--sm" onClick={() => fetchLeads(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1}>Previous</button>
                                <button className="btn btn--outline btn--sm" onClick={() => fetchLeads(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.totalPages}>Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {isLeadModalOpen && (
                <LeadModal 
                    isOpen={isLeadModalOpen}
                    onClose={() => { setIsLeadModalOpen(false); setEditingLead(null); }}
                    onSave={handleSaveLead}
                    lead={editingLead}
                    token={token}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDeleteLead}
                />
            )}
        </div>
    );
}