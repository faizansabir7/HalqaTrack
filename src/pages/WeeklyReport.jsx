import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ChevronLeft, FileText, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './WeeklyReport.css';

const WeeklyReport = () => {
    const { areas, halqas, meetings } = useData();
    const [selectedReason, setSelectedReason] = React.useState(null);

    // Logic for generating report rows (Moved from Dashboard)
    const reportRows = areas.flatMap(area => {
        const areaHalqas = (halqas || []).filter(h => h.area_id === area.id);

        return areaHalqas.map(halqa => {
            const meeting = (meetings || []).find(m => m.halqa_id === halqa.id);
            const status = meeting?.status || 'pending';
            const isHeld = status === 'completed';
            const isCancelled = status === 'cancelled';

            // Calculate stats
            const participation = meeting?.attendance ? Object.values(meeting.attendance).filter(Boolean).length : 0;
            const strength = halqa.members?.length || 0;

            return (
                <tr key={halqa.id}>
                    <td className="cell-center">#</td>
                    <td style={{ backgroundColor: `${area.color}20`, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {halqa.name}
                    </td>
                    <td className={isHeld ? 'cell-yes' : isCancelled ? 'cell-cancelled' : 'cell-no'}>
                        {isHeld ? 'YES' : isCancelled ? (
                            <button
                                className="btn-reason-trigger"
                                onClick={() => setSelectedReason({ halqa: halqa.name, reason: meeting.cancelled_reason })}
                            >
                                CANCELLED
                            </button>
                        ) : 'NO'}
                    </td>
                    <td className="cell-center">{isCancelled ? '-' : participation}</td>
                    <td className="cell-center">{isCancelled ? '-' : strength}</td>
                </tr>
            );
        });
    });

    // Add Index
    const indexedReportRows = reportRows.map((row, idx) => React.cloneElement(row, {},
        [
            <td key="idx" className="cell-center">{idx + 1}</td>,
            ...React.Children.toArray(row.props.children).slice(1)
        ]
    ));

    return (
        <div className="weekly-report-page container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="report-header"
            >
                <Link to="/" className="back-link">
                    <ChevronLeft size={20} />
                    <span>BACK TO DASHBOARD</span>
                </Link>
                <h1 className="text-display text-4xl mt-4 uppercase">
                    WEEKLY <span className="text-secondary opacity-50">REPORT</span>
                </h1>
            </motion.div>

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

            {/* Reason Modal */}
            <AnimatePresence>
                {selectedReason && (
                    <div className="modal-backdrop" onClick={() => setSelectedReason(null)}>
                        <motion.div
                            className="reason-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <div className="header-info">
                                    <AlertCircle size={20} className="text-danger" />
                                    <div>
                                        <h3>Cancelled Meeting Reason</h3>
                                        <p>{selectedReason.halqa}</p>
                                    </div>
                                </div>
                                <button className="btn-close-modal" onClick={() => setSelectedReason(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                {selectedReason.reason || "No reason provided by the Area Leader."}
                            </div>
                            <div className="modal-footer">
                                <button className="btn-modal-done" onClick={() => setSelectedReason(null)}>GOT IT</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WeeklyReport;
