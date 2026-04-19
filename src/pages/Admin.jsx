import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { getCustomWeekDetails, HALQA_MEETING_NAMES } from '../utils/dateUtils';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, Users, Save, X, Activity, Layers, UserCheck, Calendar, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import './Admin.css';

const Admin = () => {
    const { areas, halqas, addHalqa, updateHalqaName, deleteHalqa, updateHalqaMembers, fetchMeetingsByDateRange } = useData();
    const [expandedAreas, setExpandedAreas] = useState({});
    const [editingHalqaId, setEditingHalqaId] = useState(null);
    const [tempHalqaName, setTempHalqaName] = useState('');
    const [managingMembersHalqaId, setManagingMembersHalqaId] = useState(null);
    const [editedMembers, setEditedMembers] = useState([]);
    const [newMemberName, setNewMemberName] = useState('');

    // Duration Report State
    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState('');
    const [durationReportData, setDurationReportData] = useState(null);
    const [durationReportTypeSummary, setDurationReportTypeSummary] = useState(null);
    const [durationReportAreaTypeSummary, setDurationReportAreaTypeSummary] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Duration Report Logic
    const handleGenerateReport = async () => {
        if (!reportStartDate || !reportEndDate) {
            alert('Please select both start and end dates.');
            return;
        }

        setIsGenerating(true);
        const fetchedMeetings = await fetchMeetingsByDateRange(reportStartDate, reportEndDate);

        const report = [];
        areas.forEach(area => {
            const areaHalqas = halqas.filter(h => h.area_id === area.id);
            areaHalqas.forEach(halqa => {
                const hMeetings = fetchedMeetings.filter(m => m.halqa_id === halqa.id);
                const heldCount = hMeetings.filter(m => m.status === 'completed').length;
                const cancelledCount = hMeetings.filter(m => m.status === 'cancelled').length;

                let totalParticipation = 0;
                hMeetings.forEach(m => {
                    if (m.status === 'completed' && m.attendance) {
                        totalParticipation += Object.values(m.attendance).filter(Boolean).length;
                    }
                });

                const strength = halqa.members?.length || 0;

                const halqaTypes = {
                    "Thazkiya Halqa": 0,
                    "Prasthana Halqa": 0,
                    "Pothu Halqa": 0,
                    "Thahreeki Halqa": 0,
                    "Sargga Halqa": 0
                };
                hMeetings.forEach(m => {
                    if (m.status === 'completed') {
                        const defaultDetails = getCustomWeekDetails(m.week_start_date);
                        const type = m.custom_agenda_week ? HALQA_MEETING_NAMES[m.custom_agenda_week] : (defaultDetails.meetingName || 'Other');
                        if (halqaTypes[type] !== undefined) {
                            halqaTypes[type] += 1;
                        }
                    }
                });

                report.push({
                    id: halqa.id,
                    areaName: area.name,
                    halqaName: halqa.name,
                    areaColor: area.color,
                    held: heldCount,
                    cancelled: cancelledCount,
                    totalParticipation,
                    avgParticipation: heldCount > 0 ? (totalParticipation / heldCount).toFixed(1) : 0,
                    strength,
                    thazkiyaCount: halqaTypes['Thazkiya Halqa'],
                    prasthanaCount: halqaTypes['Prasthana Halqa'],
                    pothuCount: halqaTypes['Pothu Halqa'],
                    thahreekiCount: halqaTypes['Thahreeki Halqa'],
                    sarggaCount: halqaTypes['Sargga Halqa']
                });
            });
        });

        const typeSummary = {
            "Thazkiya Halqa": 0,
            "Prasthana Halqa": 0,
            "Pothu Halqa": 0,
            "Thahreeki Halqa": 0,
            "Sargga Halqa": 0
        };

        const areaTypeSummary = {};
        areas.forEach(a => {
            areaTypeSummary[a.id] = {
                "Thazkiya Halqa": 0,
                "Prasthana Halqa": 0,
                "Pothu Halqa": 0,
                "Thahreeki Halqa": 0,
                "Sargga Halqa": 0
            };
        });

        fetchedMeetings.forEach(m => {
            if (m.status === 'completed') {
                const defaultDetails = getCustomWeekDetails(m.week_start_date);
                const type = m.custom_agenda_week ? HALQA_MEETING_NAMES[m.custom_agenda_week] : (defaultDetails.meetingName || 'Other');

                if (typeSummary[type] !== undefined) {
                    typeSummary[type] += 1;
                }

                const halqa = halqas.find(h => h.id === m.halqa_id);
                if (halqa && areaTypeSummary[halqa.area_id] && areaTypeSummary[halqa.area_id][type] !== undefined) {
                    areaTypeSummary[halqa.area_id][type] += 1;
                }
            }
        });

        setDurationReportTypeSummary(typeSummary);
        setDurationReportAreaTypeSummary(areaTypeSummary);
        setDurationReportData(report);
        setIsGenerating(false);
    };

    const setDatesForLastMonths = (months) => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - months);
        setReportEndDate(end.toISOString().split('T')[0]);
        setReportStartDate(start.toISOString().split('T')[0]);
    };

    const formatDateToDDMMYYYY = (dateStr) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}-${m}-${y}`;
    };

    const exportDurationReport = () => {
        if (!durationReportData) return;

        const exportData = durationReportData.map(row => ({
            'Area Name': row.areaName,
            'Halqa Name': row.halqaName,
            'Held': row.held,
            'Thazkiya Held': row.thazkiyaCount,
            'Prasthana Held': row.prasthanaCount,
            'Pothu Held': row.pothuCount,
            'Thahreeki Held': row.thahreekiCount,
            'Sargga Held': row.sarggaCount,
            'Cancelled': row.cancelled,
            'Total Participation': row.totalParticipation,
            'Avg Participation': row.avgParticipation,
            'Strength': row.strength
        }));

        const areaSummary = areas.map(area => {
            const areaRows = durationReportData.filter(r => r.areaName === area.name);
            const totalHeld = areaRows.reduce((acc, curr) => acc + curr.held, 0);

            const areaTypes = durationReportAreaTypeSummary?.[area.id] || {};

            return {
                'Area Name': area.name,
                'Total Halqas Held': totalHeld,
                'Thazkiya Halqa': areaTypes['Thazkiya Halqa'] || 0,
                'Prasthana Halqa': areaTypes['Prasthana Halqa'] || 0,
                'Pothu Halqa': areaTypes['Pothu Halqa'] || 0,
                'Thahreeki Halqa': areaTypes['Thahreeki Halqa'] || 0,
                'Sargga Halqa': areaTypes['Sargga Halqa'] || 0
            };
        });

        const workbook = XLSX.utils.book_new();

        // 1. Details Sheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Duration Report');

        // 2. Area Summary Sheet
        const summaryWorksheet = XLSX.utils.json_to_sheet(areaSummary);
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Area Summary');

        // 3. Type Summary Sheet
        if (durationReportTypeSummary) {
            const typeSummaryArray = Object.keys(durationReportTypeSummary).map(key => ({
                'Halqa Type': key,
                'Total Done': durationReportTypeSummary[key]
            }));
            const typeSummaryWorksheet = XLSX.utils.json_to_sheet(typeSummaryArray);
            XLSX.utils.book_append_sheet(workbook, typeSummaryWorksheet, 'Type Summary');
        }

        const safeStartDate = formatDateToDDMMYYYY(reportStartDate);
        const safeEndDate = formatDateToDDMMYYYY(reportEndDate);

        XLSX.writeFile(workbook, `Admin_Report_${safeStartDate}_to_${safeEndDate}.xlsx`);
    };

    // Stats Calculation
    const totalAreas = areas.length;
    const totalHalqas = halqas.length;
    const totalMembers = halqas.reduce((acc, h) => acc + (h.members ? h.members.length : 0), 0);

    const toggleArea = (areaId) => {
        setExpandedAreas(prev => ({ ...prev, [areaId]: !prev[areaId] }));
    };

    // Halqa Handling
    const handleAddHalqa = (areaId) => {
        const name = prompt("Enter Halqa Name:");
        if (name) addHalqa(areaId, name);
    };

    const startEditingHalqa = (halqa) => {
        setEditingHalqaId(halqa.id);
        setTempHalqaName(halqa.name);
    };

    const saveHalqaName = () => {
        if (tempHalqaName.trim()) updateHalqaName(editingHalqaId, tempHalqaName);
        setEditingHalqaId(null);
    };

    const handleDeleteHalqa = (id) => {
        if (window.confirm("Delete this Halqa and all its data?")) deleteHalqa(id);
    };

    // Member Handling
    const openMemberManager = (halqa) => {
        setManagingMembersHalqaId(halqa.id);
        setEditedMembers(halqa.members || []);
    };

    const closeMemberManager = () => {
        setManagingMembersHalqaId(null);
        setEditedMembers([]);
        setNewMemberName('');
    };

    const handleCreateMember = () => {
        if (!newMemberName.trim()) return;
        const newId = `m-${managingMembersHalqaId}-${Date.now()}`;
        const newMember = { id: newId, name: newMemberName, halqaId: managingMembersHalqaId };
        const updatedList = [...editedMembers, newMember];
        setEditedMembers(updatedList);
        // Auto-save
        updateHalqaMembers(managingMembersHalqaId, updatedList);
        setNewMemberName('');
    };

    const handleDeleteMember = (memberId) => {
        const updatedList = editedMembers.filter(m => m.id !== memberId);
        setEditedMembers(updatedList);
        updateHalqaMembers(managingMembersHalqaId, updatedList);
    };

    const handleUpdateMemberName = (id, newName) => {
        const updatedList = editedMembers.map(m => m.id === id ? { ...m, name: newName } : m);
        setEditedMembers(updatedList);
    };

    const saveMemberChanges = () => {
        updateHalqaMembers(managingMembersHalqaId, editedMembers);
        closeMemberManager();
    };


    return (
        <div className="container admin-container">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="admin-header"
            >
                <h1 className="text-display text-4xl mb-2">SYSTEM<br /><span className="text-secondary">ADMINISTRATION</span></h1>
            </motion.div>

            {/* Stats Overview */}
            <div className="stats-grid">
                <StatCard icon={Layers} label="TOTAL AREAS" value={totalAreas} delay={0.1} />
                <StatCard icon={Activity} label="ACTIVE HALQAS" value={totalHalqas} delay={0.2} />
                <StatCard icon={Users} label="TOTAL MEMBERS" value={totalMembers} delay={0.3} />
            </div>

            {/* Custom Duration Report Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="duration-report-section"
            >
                <div className="section-header">
                    <Calendar size={24} className="text-secondary" />
                    <h2>Custom Duration Report</h2>
                </div>

                <div className="report-controls">
                    <div className="date-pickers">
                        <div className="date-field">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={reportStartDate}
                                onChange={(e) => setReportStartDate(e.target.value)}
                                className="admin-input"
                            />
                        </div>
                        <div className="date-field">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={reportEndDate}
                                onChange={(e) => setReportEndDate(e.target.value)}
                                className="admin-input"
                            />
                        </div>
                    </div>
                    <div className="quick-selects">
                        <button onClick={() => setDatesForLastMonths(1)} className="btn-quick">Last 1 Month</button>
                        <button onClick={() => setDatesForLastMonths(3)} className="btn-quick">Last 3 Months</button>
                        <button onClick={() => setDatesForLastMonths(6)} className="btn-quick">Last 6 Months</button>
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        className="btn-generate"
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'GENERATING...' : 'GENERATE REPORT'}
                    </button>
                </div>

                {durationReportData && (
                    <div className="report-results">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                                REPORT ({formatDateToDDMMYYYY(reportStartDate)} - {formatDateToDDMMYYYY(reportEndDate)})
                            </h3>
                            <button className="btn-generate" onClick={exportDurationReport} style={{ height: 'auto', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <Download size={18} />
                                EXPORT EXCEL
                            </button>
                        </div>

                        <div className="area-summary-cards" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                            {areas.map(area => {
                                const areaRows = durationReportData.filter(r => r.areaName === area.name);
                                const totalHeld = areaRows.reduce((acc, curr) => acc + curr.held, 0);
                                return (
                                    <div key={area.id} style={{ padding: '1rem 1.5rem', background: 'var(--bg-card-hover)', border: `1px solid ${area.color}50`, borderRadius: '12px', minWidth: '180px', flex: '0 0 auto' }}>
                                        <div style={{ color: area.color, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{area.name}</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginTop: '0.25rem' }}>{totalHeld} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>DONE</span></div>

                                        {durationReportAreaTypeSummary && durationReportAreaTypeSummary[area.id] && (
                                            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingTop: '0.5rem', borderTop: `1px solid var(--border-color)` }}>
                                                {Object.entries(durationReportAreaTypeSummary[area.id]).filter(([k, v]) => v > 0).map(([tName, tCount]) => (
                                                    <div key={tName} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        <span>{tName.replace(' Halqa', '')}</span>
                                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tCount}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {durationReportTypeSummary && (
                            <div className="type-summary-cards" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                                {Object.entries(durationReportTypeSummary).map(([typeName, count]) => (
                                    <div key={typeName} style={{ padding: '1rem 1.5rem', background: 'var(--bg-card)', border: `1px solid var(--border-color)`, borderRadius: '12px', minWidth: '140px', flex: '0 0 auto' }}>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{typeName}</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginTop: '0.25rem' }}>{count} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>DONE</span></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="report-table-container">
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>AREA</th>
                                        <th>HALQA</th>
                                        <th>HELD</th>
                                        <th title="Thazkiya Held">THAZ</th>
                                        <th title="Prasthana Held">PRAS</th>
                                        <th title="Pothu Held">POTHU</th>
                                        <th title="Thahreeki Held">THAH</th>
                                        <th title="Sargga Held">SARG</th>
                                        <th>CANCELLED</th>
                                        <th>PARTICIPATION (AVG)</th>
                                        <th>STRENGTH</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {durationReportData.map(row => (
                                        <tr key={row.id}>
                                            <td style={{ color: row.areaColor, fontWeight: 700 }}>{row.areaName}</td>
                                            <td style={{ fontWeight: 600 }}>{row.halqaName}</td>
                                            <td className="cell-yes">{row.held}</td>
                                            <td className="cell-center" style={{ fontSize: '0.8rem', opacity: row.thazkiyaCount > 0 ? 1 : 0.3 }}>{row.thazkiyaCount}</td>
                                            <td className="cell-center" style={{ fontSize: '0.8rem', opacity: row.prasthanaCount > 0 ? 1 : 0.3 }}>{row.prasthanaCount}</td>
                                            <td className="cell-center" style={{ fontSize: '0.8rem', opacity: row.pothuCount > 0 ? 1 : 0.3 }}>{row.pothuCount}</td>
                                            <td className="cell-center" style={{ fontSize: '0.8rem', opacity: row.thahreekiCount > 0 ? 1 : 0.3 }}>{row.thahreekiCount}</td>
                                            <td className="cell-center" style={{ fontSize: '0.8rem', opacity: row.sarggaCount > 0 ? 1 : 0.3 }}>{row.sarggaCount}</td>
                                            <td className={row.cancelled > 0 ? "cell-cancelled" : "cell-center"}>{row.cancelled}</td>
                                            <td className="cell-center">{row.totalParticipation} ({row.avgParticipation})</td>
                                            <td className="cell-center">{row.strength}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Areas List */}
            <div className="areas-list">
                {areas.map((area, i) => (
                    <motion.div
                        key={area.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="area-group-container"
                    >
                        <div
                            className="area-accordion-header"
                            onClick={() => toggleArea(area.id)}
                            style={{ borderLeft: `6px solid ${area.color}` }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <h2 className="text-xl font-display" style={{ margin: 0 }}>{area.name}</h2>
                                <div className="halqa-count-badge" style={{ backgroundColor: `${area.color}15`, color: area.color, borderColor: `${area.color}30` }}>
                                    <Layers size={14} />
                                    <span>{halqas.filter(h => h.area_id === area.id).length} HALQAS</span>
                                </div>
                            </div>
                            <motion.div
                                animate={{ rotate: expandedAreas[area.id] ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronDown style={{ color: area.color }} />
                            </motion.div>
                        </div>

                        <AnimatePresence>
                            {expandedAreas[area.id] && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="accordion-content"
                                >
                                    <div className="halqas-grid">
                                        {halqas.filter(h => h.area_id === area.id).map(halqa => (
                                            <div key={halqa.id} className="halqa-card">
                                                <div className="halqa-card-header">
                                                    {editingHalqaId === halqa.id ? (
                                                        <input
                                                            autoFocus
                                                            className="edit-input"
                                                            value={tempHalqaName}
                                                            onChange={(e) => setTempHalqaName(e.target.value)}
                                                            onBlur={saveHalqaName}
                                                            onKeyDown={(e) => e.key === 'Enter' && saveHalqaName()}
                                                        />
                                                    ) : (
                                                        <h3 className="font-bold">{halqa.name}</h3>
                                                    )}
                                                    <div className="halqa-badge">
                                                        <Users size={12} />
                                                        {halqa.members?.length || 0}
                                                    </div>
                                                </div>

                                                <div className="halqa-actions">
                                                    <button onClick={() => openMemberManager(halqa)} className="action-btn">
                                                        <UserCheck size={14} /> Members
                                                    </button>
                                                    <button onClick={() => startEditingHalqa(halqa)} className="action-btn">
                                                        <Edit2 size={14} /> Rename
                                                    </button>
                                                    <button onClick={() => handleDeleteHalqa(halqa.id)} className="action-btn danger">
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => handleAddHalqa(area.id)} className="add-halqa-btn">
                                            <Plus size={20} />
                                            <span>Add New Halqa</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {/* Member Manager Modal */}
            <AnimatePresence>
                {managingMembersHalqaId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-backdrop"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="modal-glass"
                        >
                            <div className="modal-top">
                                <div>
                                    <h2 className="text-xl font-display">Manage Members</h2>
                                    <p className="text-secondary text-sm">Add or remove members for this Halqa</p>
                                </div>
                                <button onClick={saveMemberChanges} className="close-btn">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="member-list-scroll">
                                <AnimatePresence>
                                    {editedMembers.map(member => (
                                        <motion.div
                                            key={member.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10, height: 0 }}
                                            className="member-item"
                                        >
                                            <div className="member-avatar">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <input
                                                value={member.name}
                                                onChange={(e) => handleUpdateMemberName(member.id, e.target.value)}
                                                className="member-name-input"
                                            />
                                            <button onClick={() => handleDeleteMember(member.id)} className="delete-icon">
                                                <Trash2 size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="add-member-section">
                                <input
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    placeholder="Enter new member name..."
                                    className="new-member-input"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateMember()}
                                />
                                <button onClick={handleCreateMember} className="add-btn-primary">
                                    <Plus size={18} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="stat-card"
    >
        <div className="stat-icon-wrapper">
            <Icon size={20} />
        </div>
        <div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
        </div>
    </motion.div>
);

export default Admin;
