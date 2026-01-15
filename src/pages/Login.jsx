import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Default system password - in real app use env variable
    const SYSTEM_PASSWORD = "admin";

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
            background: 'var(--bg-app)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '3rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.01)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        color: 'white'
                    }}>
                        <Lock size={24} />
                    </div>
                    <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>SYSTEM ACCESS</h1>
                    <p className="text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.7rem' }}>Restricted Area</p>
                </div>

                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(false); }}
                        placeholder="ENTER PASSWORD"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'transparent',
                            border: `1px solid ${error ? 'var(--color-danger)' : 'rgba(255,255,255,0.2)'}`,
                            borderRadius: '0',
                            color: 'white',
                            marginBottom: '1rem',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            letterSpacing: '0.1em',
                            transition: 'border-color 0.2s'
                        }}
                        autoFocus
                    />
                    {error && <p className="text-sm" style={{ color: 'var(--color-danger)', marginBottom: '1rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>Access Denied</p>}

                    <button
                        type="submit"
                        className="btn-save"
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            marginTop: '1rem',
                            background: 'white',
                            color: 'black',
                            border: '1px solid white',
                            borderRadius: '0',
                            textTransform: 'uppercase',
                            fontSize: '0.8rem',
                            letterSpacing: '0.1em',
                            padding: '1rem'
                        }}
                    >
                        Authenticate
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        style={{
                            width: '100%',
                            marginTop: '2rem',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            fontSize: '0.7rem',
                            border: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            opacity: 0.5,
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
