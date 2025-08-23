import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export default function AuthPage({ onLogin }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        const email = e.target.elements.loginEmail.value;
        const password = e.target.elements.loginPassword.value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to login');
            
            // The user object from backend is just { _id, email }
            onLogin(data.token, { id: data._id, email: data.email });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        const email = e.target.elements.registerEmail.value;
        const password = e.target.elements.registerPassword.value;

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to register');

            setSuccess('Registration successful! Please log in.');
            setIsRegistering(false); // Switch to login form
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {isRegistering ? (
                // Registration Form
                <div className="auth-form">
                    <div className="card">
                        <div className="card__body">
                            <h2>Create Account</h2>
                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}
                            <form onSubmit={handleRegisterSubmit}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="registerEmail">Email</label>
                                    <input type="email" id="registerEmail" className="form-control" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="registerPassword">Password</label>
                                    <input type="password" id="registerPassword" className="form-control" required />
                                </div>
                                <button type="submit" className="btn btn--primary btn--full-width" disabled={loading}>
                                    {loading ? 'Registering...' : 'Register'}
                                </button>
                            </form>
                            <p className="auth-switch">
                                Already have an account?
                                <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(false); }}> Login here</a>
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                // Login Form
                <div className="auth-form">
                    <div className="card">
                        <div className="card__body">
                            <h2>Login</h2>
                             {error && <div className="error-message">{error}</div>}
                             {success && <div className="success-message">{success}</div>}
                            <form onSubmit={handleLoginSubmit}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="loginEmail">Email</label>
                                    <input type="email" id="loginEmail" className="form-control" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="loginPassword">Password</label>
                                    <input type="password" id="loginPassword" className="form-control" required />
                                </div>
                                <button type="submit" className="btn btn--primary btn--full-width" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>
                            <p className="auth-switch">
                                Don't have an account?
                                <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(true); }}> Register here</a>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
