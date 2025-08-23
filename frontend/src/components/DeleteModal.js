import React from 'react';

export default function DeleteModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content modal-content--sm">
                <div className="modal-header">
                    <h3>Confirm Delete</h3>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <p>Are you sure you want to delete this lead? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
                    <button type="button" className="btn btn--primary" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
}
