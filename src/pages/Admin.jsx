import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, Users, Save, X, Activity, Layers, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Admin.css';

const Admin = () => {
    const { areas, halqas, addHalqa, updateHalqaName, deleteHalqa, updateHalqaMembers } = useData();
    const [expandedAreas, setExpandedAreas] = useState({});
    const [editingHalqaId, setEditingHalqaId] = useState(null);
    const [tempHalqaName, setTempHalqaName] = useState('');
    const [managingMembersHalqaId, setManagingMembersHalqaId] = useState(null);
    const [editedMembers, setEditedMembers] = useState([]);
    const [newMemberName, setNewMemberName] = useState('');

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
