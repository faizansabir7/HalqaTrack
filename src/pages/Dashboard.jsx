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
    const { areas, halqas, meetings, getAreaStats, currentWeekStart, changeWeek, goToToday, seedDatabase } = useData();

    if (!areas || areas.length === 0) {
        return (
            <div className="container p-8 text-center" style={{ paddingTop: '20vh' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-display text-4xl mb-4">NO DATA FOUND</h2>
                    <p className="text-secondary mb-8">The void awaits your input.</p>
                    <button onClick={seedDatabase} className="btn-save flex items-center justify-center gap-2 mx-auto">
                        <Database size={18} />
                        INITIALIZE DATABASE
                    </button>
                </motion.div>
            </div>
        );
    }

    const reportRows = areas.flatMap(area => {
        const areaHalqas = (halqas || []).filter(h => h.area_id === area.id);

        return areaHalqas.map(halqa => {
            const meeting = (meetings || []).find(m => m.halqa_id === halqa.id);
            const isHeld = meeting?.status === 'completed';

            // Calculate stats
            const participation = meeting?.attendance ? Object.values(meeting.attendance).filter(Boolean).length : 0;
            const strength = halqa.members?.length || 0;

            return (
                <tr key={halqa.id}>
                    <td className="cell-center" style={{ width: '50px' }}>
                        {/* We need a global index, but flatMap makes it tricky. 
                            CSS counter is better, or just use slice index? 
                            Let's just use a simple value or skip index for now to prevent crash complexity.
                            Actually, let's just map afterwards if we need index, or use filtered list index.
                        */}
                        #
                    </td>
                    <td style={{ backgroundColor: `${area.color}20`, fontWeight: 600, color: 'white' }}>
                        {area.name}-{halqa.name}
                    </td>
                    <td className={isHeld ? 'cell-yes' : 'cell-no'}>
                        {isHeld ? 'YES' : 'NO'}
                    </td>
                    <td className="cell-center">{participation}</td>
                    <td className="cell-center">{strength}</td>
                </tr>
            );
        });
    });

    // To add Index properly:
    const indexedReportRows = reportRows.map((row, idx) => React.cloneElement(row, {},
        [
            <td key="idx" className="cell-center">{idx + 1}</td>,
            ...React.Children.toArray(row.props.children).slice(1)
        ]
    ));


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

            <div className="report-section">
                <h2 className="report-title">WEEKLY REPORT</h2>
                <div className="report-table-container">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>HALQA NAME</th>
                                <th>HELD</th>
                                <th>PARTICIPATION</th>
                                <th>STRENGTH</th>
                            </tr>
                        </thead>
                        <tbody>
                            {indexedReportRows}
                        </tbody>
                    </table>
                </div>

                {/* Summary Box */}
                <div className="report-summary">
                    <div className="summary-row">
                        <span>TOTAL HALQA HELD LAST WEEK</span>
                        <span className="summary-value">
                            {(meetings || []).filter(m => m.status === 'completed' && (halqas || []).some(h => h.id === m.halqa_id)).length}
                        </span>
                    </div>
                    <div className="summary-row">
                        <span>NO OF HALQAS WITH NO MEETING LAST WEEK</span>
                        <span className="summary-value">
                            {(halqas || []).length - (meetings || []).filter(m => m.status === 'completed' && (halqas || []).some(h => h.id === m.halqa_id)).length}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

