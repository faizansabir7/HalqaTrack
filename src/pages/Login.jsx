import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Default system password - uses Env variable or fallback
    const SYSTEM_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin";

    const from = location.state?.from?.pathname || "/admin";

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === SYSTEM_PASSWORD) {
            // Set session storage
            sessionStorage.setItem('isAdmin', 'true');
            navigate(from, { replace: true });
        } else {
            setError(true);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 2000,
            background: 'transparent' // Body has mesh gradient
        }}>
            <div style={{
                width: '100%',
                maxWidth: '450px',
                padding: '3.5rem',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(32px)',
                webkitBackdropFilter: 'blur(32px)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 40px 120px rgba(0, 0, 0, 0.1)',
                margin: '1.5rem'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--color-primary-light)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem auto',
                        color: 'var(--color-primary)',
                        boxShadow: '0 8px 30px rgba(79, 70, 229, 0.15)',
                        transform: 'rotate(-5deg)'
                    }}>
                        <Lock size={32} />
                    </div>
                    <h1 className="text-display" style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        letterSpacing: '-0.02em',
                        marginBottom: '0.75rem',
                        color: 'var(--text-primary)',
                        lineHeight: '1'
                    }}>SYSTEM<br />ACCESS</h1>
                    <p className="text-secondary" style={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        fontSize: '0.7rem',
                        fontWeight: '700'
                    }}>Secured Portal</p>
                </div>

                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(false); }}
                        placeholder="ENTER PASSWORD"
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            background: 'white',
                            border: `2px solid ${error ? 'var(--color-danger)' : 'var(--border-color)'}`,
                            borderRadius: '16px',
                            color: 'var(--text-primary)',
                            marginBottom: '1rem',
                            fontSize: '1rem',
                            textAlign: 'center',
                            fontWeight: '700',
                            letterSpacing: '0.2em',
                            transition: 'all 0.2s',
                            outline: 'none',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}
                        autoFocus
                    />
                    {error && <p style={{
                        color: 'var(--color-danger)',
                        marginBottom: '1rem',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '0.75rem',
                        fontWeight: '700'
                    }}>Access Denied. Try Again.</p>}

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            marginTop: '1.5rem',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '99px',
                            textTransform: 'uppercase',
                            fontSize: '0.85rem',
                            fontWeight: '800',
                            letterSpacing: '0.1em',
                            padding: '1.25rem',
                            cursor: 'pointer',
                            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        Authenticate
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        style={{
                            width: '100%',
                            marginTop: '2.5rem',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            fontSize: '0.75rem',
                            border: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontWeight: '700',
                            opacity: 0.6,
                            cursor: 'pointer'
                        }}
                    >
                        Return to Public Site
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
