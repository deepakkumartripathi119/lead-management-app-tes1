import React, { useState, useEffect, useRef } from 'react';
import AuthPage from './components/AuthPage';
import LeadsDashboard from './components/LeadsDashboard';

const API_URL = process.env.REACT_APP_API_URL;

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);
    const wasManualLogout = useRef(false);

    useEffect(() => {
        const verifyUserSession = async () => {
            try {
                const response = await fetch(`${API_URL}/auth/me`, {
                    credentials: 'include',
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Session verification failed:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

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
            // Call the backend endpoint that clears the httpOnly cookie
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            // Always clear the user state on the frontend
            setUser(null);
            setSessionExpired(false);
            setTimeout(() => { wasManualLogout.current = false; }, 2000); // reset after a short delay
        }
    };

    // Display a loading message while the app verifies the user's session
    if (loading) {
        return <div>Loading application...</div>;
    }

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
