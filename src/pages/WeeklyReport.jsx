import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ChevronLeft, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import './WeeklyReport.css';

const WeeklyReport = () => {
    const { areas, halqas, meetings } = useData();

    // Logic for generating report rows (Moved from Dashboard)
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
                    <td className="cell-center" style={{ width: '50px' }}>#</td>
                    <td style={{ backgroundColor: `${area.color}20`, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {halqa.name}
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
        </div>
    );
};

export default WeeklyReport;
