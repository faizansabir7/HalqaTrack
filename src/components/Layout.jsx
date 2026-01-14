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
            </main>
        </div>
    );
};

export default Layout;
