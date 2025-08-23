import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import LeadsDashboard from './components/LeadsDashboard';

const API_URL = process.env.REACT_APP_API_URL;

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUserSession = async () => {
            try {
                // The browser automatically sends the httpOnly cookie with this request
                const response = await fetch(`${API_URL}/auth/me`, {
                    credentials: 'include', // This is crucial for sending cookies
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    // If the response is not ok (e.g., 401), there's no valid session
                    setUser(null);
                }
            } catch (error) {
                // Network errors or other issues
                console.error("Session verification failed:", error);
                setUser(null);
            } finally {
                // We're done checking, so stop loading
                setLoading(false);
            }
        };

        verifyUserSession();
    }, []); // The empty dependency array ensures this runs only once on app start

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);
    };

    const handleLogout = async () => {
        try {
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
                <AuthPage onLogin={handleLogin} />
            )}
        </div>
    );
}
