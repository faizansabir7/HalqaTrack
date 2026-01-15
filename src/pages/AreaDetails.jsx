import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ChevronLeft, Calendar, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import './AreaDetails.css';

const AreaDetails = () => {
    const { areaId } = useParams();
    const { areas, halqas, meetings } = useData();

    const area = areas.find(a => a.id === areaId);
    const areaHalqas = halqas.filter(h => h.area_id === areaId);

    if (!area) return <div className="p-8 text-center text-secondary">Area not found</div>;

    return (
        <div className="area-details-page container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="area-header"
            >
                <Link to="/" className="back-link">
                    <ChevronLeft size={20} />
                    <span>BACK TO DASHBOARD</span>
                </Link>
                <h1 className="text-display text-4xl mt-4 uppercase">
                    {area.name} <span className="text-secondary opacity-50">// AREA</span>
                </h1>
            </motion.div>

            {/* Swiss Grid Table Layout */}
            <div className="halqa-grid-table">
                {/* Table Header */}
                <div className="grid-header-row">
                    <div className="col-index">#</div>
                    <div className="col-name">HALQA NAME</div>
                    <div className="col-status">STATUS</div>
                    <div className="col-members">MEMBERS</div>
                    <div className="col-action">ACTION</div>
                </div>

                {/* Table Rows */}
                {areaHalqas.map((halqa, index) => {
                    const meeting = meetings.find(m => m.halqa_id === halqa.id);
                    const status = meeting ? meeting.status : 'pending';

                    return (
                        <Link
                            to={`/meeting/${halqa.id}`}
                            key={halqa.id}
                            className="grid-row"
                        >
                            <div className="col-index">{String(index + 1).padStart(2, '0')}</div>
                            <div className="col-name">{halqa.name}</div>
                            <div className="col-status">
                                <span className={`status-badge ${status}`}>{status}</span>
                            </div>
                            <div className="col-members">{halqa.members?.length || 0}</div>
                            <div className="col-action">
                                <span className="btn-manage">MANAGE</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default AreaDetails;
