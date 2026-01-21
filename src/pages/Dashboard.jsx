import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { FileCheck, AlertCircle, ArrowUpRight, Database, Settings } from 'lucide-react';
import WeekSelector from '../components/WeekSelector';
import { motion } from 'framer-motion';
import './Dashboard.css';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        }
    }
};

const item = {
    hidden: { y: 100, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const Dashboard = () => {
    const { areas, halqas, meetings, getAreaStats, currentWeekStart, changeWeek, goToToday, goToDate, seedDatabase, loading } = useData();

    if (loading) {
        return (
            <div className="container flex items-center justify-center" style={{ height: '80vh' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-12 h-12 border-2 border-t-transparent border-primary rounded-full animate-spin" />
                    <p className="text-secondary text-sm tracking-widest uppercase">Loading System...</p>
                </motion.div>
            </div>
        );
    }

    if (!areas || areas.length === 0) {
        return (
            <div className="container flex items-center justify-center text-center" style={{ height: '80vh' }}>
                <p className="text-secondary opacity-20 text-sm tracking-widest">NO DATA AVAILABLE</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <motion.div
                className="hero-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
            >
                <h1 className="hero-title">
                    CITY<br />
                    <span className="text-secondary" style={{ whiteSpace: 'nowrap' }}>OVERVIEW //</span>
                </h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="controls-bar"
            >
                <WeekSelector
                    currentWeekStart={currentWeekStart}
                    onPrev={() => changeWeek(-1)}
                    onNext={() => changeWeek(1)}
                    onToday={goToToday}
                    onDateSelect={goToDate}
                />

                <Link to="/login" className="admin-link-btn">
                    <Settings size={16} />
                    <span>Manage System</span>
                </Link>
            </motion.div>

            <motion.div
                className="area-list"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {areas.map((area, index) => {
                    const stats = getAreaStats(area.id);
                    const completionRate = Math.round((stats.completed / (stats.total || 1)) * 100);

                    return (
                        <motion.div variants={item} key={area.id} className="area-list-item-wrapper">
                            <Link to={`/area/${area.id}`} className="area-list-item">
                                <div className="area-index">0{index + 1}</div>
                                <div className="area-name">{area.name}</div>

                                <div className="area-stats">
                                    <div className="stat-group">
                                        <span className="label">TARGET</span>
                                        <span className="value">{stats.total} HALQAS</span>
                                    </div>
                                    <div className="stat-group">
                                        <span className="label">COMPLETION</span>
                                        <span className="value" style={{ color: completionRate >= 80 ? '#10b981' : '#888' }}>
                                            {stats.completed}/{stats.total} ({completionRate}%)
                                        </span>
                                    </div>
                                </div>

                                <div className="area-action">
                                    <ArrowUpRight size={32} />
                                </div>

                                {/* Hover Reveal Background */}
                                <div
                                    className="hover-bg"
                                    style={{ background: `linear-gradient(90deg, ${area.color}20, transparent)` }}
                                />
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Weekly Report Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="report-action-container"
            >
                <Link to="/report" className="btn-view-report">
                    <FileCheck size={20} />
                    <span>VIEW WEEKLY REPORT</span>
                </Link>
            </motion.div>
        </div>
    );
};

export default Dashboard;
