import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import './Layout.css';

const Layout = () => {
    const location = useLocation();

    return (
        <div className="app-layout">


            {/* Minimal Floating Header */}
            <header className="fixed-header">
                <Link to="/" className="logo-text">HALQA<span className="text-secondary">TRACKER</span></Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="date-display">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <Link to="/admin" className="text-secondary hover:text-white" title="Admin Portal">
                        <LayoutDashboard size={20} />
                    </Link>
                </div>
            </header>

            <main className="app-main">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>

                <footer style={{
                    textAlign: 'center',
                    padding: '3rem 1rem 2rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    opacity: 0.8
                }}>
                    <div style={{ height: '2px', width: '30px', background: 'var(--accent-color)', borderRadius: '2px', opacity: 0.5 }}></div>
                    <div style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <span style={{ fontWeight: 500 }}>DEVELOPED BY</span>
                        <a href="mailto:faizantp7@gmail.com" style={{ textDecoration: 'none', fontWeight: 800, color: 'var(--text-primary)', marginLeft: '0.4rem', letterSpacing: '0.1em', cursor: 'pointer' }}>FAIZAN</a>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default Layout;
