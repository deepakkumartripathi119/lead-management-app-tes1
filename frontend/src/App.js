import React, { useState, useEffect, useRef } from 'react';
import AuthPage from './components/AuthPage';
import LeadsDashboard from './components/LeadsDashboard';

const API_URL =
        window.location.hostname === 'localhost'
            ? 'http://localhost:5001/api'
        : process.env.REACT_APP_API_URL;

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);
    const wasManualLogout = useRef(false);

    useEffect(() => {
        async function verifyUserSession() {
            try {
                const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        verifyUserSession();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetch(`${API_URL}/auth/me`, { credentials: 'include' })
                .then(res => {
                    if (!res.ok) {
                        setUser(null);
                        if (!wasManualLogout.current) setSessionExpired(true);
                    }
                })
                .catch(() => {
                    setUser(null);
                    if (!wasManualLogout.current) setSessionExpired(true);
                });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);
        setSessionExpired(false);
    };

    const handleLogout = async () => {
        try {
            wasManualLogout.current = true;
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (err) {
            // ignore
        } finally {
            setUser(null);
            setSessionExpired(false);
            setTimeout(() => { wasManualLogout.current = false; }, 2000);
        }
    };

    if (loading) return <div>Loading application...</div>;

    return (
        <div>
            {user ? (
                <LeadsDashboard user={user} onLogout={handleLogout} />
            ) : (
                <AuthPage onLogin={handleLogin} sessionExpired={sessionExpired} />
            )}
        </div>
    );
}

export default App;
