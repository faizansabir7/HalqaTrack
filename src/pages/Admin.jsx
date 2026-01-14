import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, Users, Save, X } from 'lucide-react';
import './Admin.css';

const Admin = () => {
    const { areas, halqas, addHalqa, updateHalqaName, deleteHalqa, updateHalqaMembers } = useData();
    const [expandedAreas, setExpandedAreas] = useState({});
    const [editingHalqaId, setEditingHalqaId] = useState(null);
    const [tempHalqaName, setTempHalqaName] = useState('');
    const [managingMembersHalqaId, setManagingMembersHalqaId] = useState(null);
    const [editedMembers, setEditedMembers] = useState([]);
    const [newMemberName, setNewMemberName] = useState('');

    const toggleArea = (areaId) => {
        setExpandedAreas(prev => ({ ...prev, [areaId]: !prev[areaId] }));
    };

    // Halqa Management
    const handleAddHalqa = (areaId) => {
        const name = prompt("Enter Halqa Name:");
        if (name) {
            addHalqa(areaId, name);
        }
    };

    const startEditingHalqa = (halqa) => {
        setEditingHalqaId(halqa.id);
        setTempHalqaName(halqa.name);
    };

    const saveHalqaName = () => {
        if (tempHalqaName.trim()) {
            updateHalqaName(editingHalqaId, tempHalqaName);
        }
        setEditingHalqaId(null);
    };

    const handleDeleteHalqa = (id) => {
        if (window.confirm("Are you sure you want to delete this Halqa? include all meetings?")) {
            deleteHalqa(id);
        }
    };

    // Member Management
    const openMemberManager = (halqa) => {
        setManagingMembersHalqaId(halqa.id);
        setEditedMembers(halqa.members || []);
    };

    const closeMemberManager = () => {
        setManagingMembersHalqaId(null);
        setEditedMembers([]);
    };

    const handleCreateMember = () => {
        if (!newMemberName.trim()) return;
        const newId = `m-${managingMembersHalqaId}-${Date.now()}`;
        const newMember = { id: newId, name: newMemberName, halqaId: managingMembersHalqaId };

        const updatedList = [...editedMembers, newMember];
        setEditedMembers(updatedList);
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

    // Save members entirely? Logic above saves per action for simplicity or we can save on close.
    // The previous implementation used optimistic context updates.
    // We can just keep syncing state with context on every change for "instant" feel
    // or add a Save button. Let's sync on change for now as in handleCreate/Delete.

    const saveMemberChanges = () => {
        updateHalqaMembers(managingMembersHalqaId, editedMembers);
        closeMemberManager();
    };

    return (
        <div className="container admin-container">
            <h1 className="text-2xl mb-8 font-display">System Administration</h1>

            {managingMembersHalqaId && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <div className="modal-header">
                            <h2 className="text-xl">Manage Members</h2>
                            <button onClick={closeMemberManager}><X size={20} /></button>
                        </div>

                        <div className="member-list-editor">
                            {editedMembers.map(member => (
                                <div key={member.id} className="member-row">
                                    <input
                                        value={member.name}
                                        onChange={(e) => handleUpdateMemberName(member.id, e.target.value)}
                                        className="simple-input"
                                    />
                                    <button onClick={() => handleDeleteMember(member.id)} className="text-red-500 hover:text-red-400">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="add-member-row mt-4">
                            <input
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                placeholder="New Member Name"
                                className="simple-input flex-1"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateMember()}
                            />
                            <button onClick={handleCreateMember} className="btn-primary-sm">
                                <Plus size={16} /> Add
                            </button>
                        </div>

                        <div className="modal-footer mt-6">
                            <button onClick={saveMemberChanges} className="btn-save w-full justify-center">Done</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="areas-list">
                {areas.map(area => (
                    <div key={area.id} className="area-group mb-4">
                        <div
                            className="area-header card p-4 flex justify-between items-center cursor-pointer"
                            onClick={() => toggleArea(area.id)}
                            style={{ borderColor: area.color }}
                        >
                            <h2 className="text-lg font-bold" style={{ color: area.color }}>{area.name}</h2>
                            {expandedAreas[area.id] ? <ChevronDown /> : <ChevronRight />}
                        </div>

                        {expandedAreas[area.id] && (
                            <div className="halqas-list pl-4 mt-2">
                                {halqas.filter(h => h.area_id === area.id).map(halqa => (
                                    <div key={halqa.id} className="halqa-item card p-3 mb-2 flex justify-between items-center">
                                        {editingHalqaId === halqa.id ? (
                                            <div className="flex gap-2 flex-1 mr-4">
                                                <input
                                                    value={tempHalqaName}
                                                    onChange={(e) => setTempHalqaName(e.target.value)}
                                                    className="simple-input flex-1"
                                                />
                                                <button onClick={saveHalqaName} className="text-green-500"><Save size={16} /></button>
                                                <button onClick={() => setEditingHalqaId(null)} className="text-gray-500"><X size={16} /></button>
                                            </div>
                                        ) : (
                                            <span className="font-medium">{halqa.name}</span>
                                        )}

                                        <div className="actions flex gap-2">
                                            <button onClick={() => openMemberManager(halqa)} className="btn-icon" title="Manage Members">
                                                <Users size={16} />
                                            </button>
                                            <button onClick={() => startEditingHalqa(halqa)} className="btn-icon" title="Edit Name">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteHalqa(halqa.id)} className="btn-icon text-red-500" title="Delete Halqa">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => handleAddHalqa(area.id)} className="btn-add-halqa mt-2">
                                    <Plus size={16} /> Add Halqa
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Admin;
