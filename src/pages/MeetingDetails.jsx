import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { WEEKLY_AGENDAS } from '../data/mockData';
import { getCustomWeekDetails, HALQA_MEETING_NAMES } from '../utils/dateUtils';
import { ChevronLeft, UserCheck, CheckSquare, Save, Users, Target, Plus, Trash2, Edit3 } from 'lucide-react';
import './MeetingDetails.css';

const MeetingDetails = () => {
    // Note: The route is /meeting/:meetingId, but AreaDetails sends halqa.id
    // So we treat the param as `halqaId` effectively for this flow.
    // If we wanted to support direct meeting links, we'd need to detect format.
    // For now, let's assume the ID passed is the HALQA ID and we find the current week's meeting for it.
    const { meetingId: paramId } = useParams();
    const navigate = useNavigate();
    const { meetings, halqas, updateMeeting, getOrCreateMeeting } = useData();

    // Local state
    const [meeting, setMeeting] = useState(null);
    const [formData, setFormData] = useState(null);
    const [halqa, setHalqa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newCustomAgenda, setNewCustomAgenda] = useState('');
    const [isEditingType, setIsEditingType] = useState(false);

    useEffect(() => {
        const loadMeetingData = async () => {
            if (!paramId) return;

            setLoading(true);
            try {
                // 1. Resolve Halqa
                // paramId could be halqaId OR meetingId. 
                // Let's try to find a halqa with this ID first.
                let targetHalqa = halqas.find(h => h.id === paramId);
                let targetMeeting = null;

                if (targetHalqa) {
                    // It IS a Halqa ID, so find/create current week's meeting
                    targetMeeting = await getOrCreateMeeting(targetHalqa.id);
                } else {
                    // It might be a direct meeting ID (legacy or direct link)
                    targetMeeting = meetings.find(m => m.id === paramId);
                    if (targetMeeting) {
                        targetHalqa = halqas.find(h => h.id === targetMeeting.halqa_id);
                    }
                }

                if (targetMeeting && targetHalqa) {
                    setMeeting(targetMeeting);
                    setFormData(targetMeeting);
                    setHalqa(targetHalqa);
                } else {
                    console.error("Could not resolve meeting or halqa", { paramId });
                }
            } catch (err) {
                console.error("Error loading meeting details", err);
            } finally {
                setLoading(false);
            }
        };

        if (halqas.length > 0) {
            loadMeetingData();
        }
    }, [paramId, halqas, meetings]); // Depend on data context updates

    // Handle Loading State
    if (loading) {
        return (
            <div className="container p-8 text-center" style={{ paddingTop: '30vh' }}>
                <div style={{ marginBottom: '1rem', fontSize: '2rem', fontFamily: 'var(--font-display)' }}>
                    LOADING...
                </div>
                <p className="text-secondary">
                    Retrieving meeting details...
                </p>
            </div>
        );
    }

    if (!meeting || !formData || !halqa) {
        return (
            <div className="container p-8 text-center" style={{ paddingTop: '30vh' }}>
                <div style={{ marginBottom: '1rem', fontSize: '2rem', fontFamily: 'var(--font-display)' }}>
                    MEETING NOT FOUND
                </div>
                <p className="text-secondary">
                    Could not find meeting data for ID: {paramId}
                </p>
                <div style={{ marginTop: '2rem' }}>
                    <button onClick={() => navigate(-1)} className="back-btn-simple" style={{ margin: '0 auto' }}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const handleAttendanceChange = (memberId) => {
        setFormData(prev => ({
            ...prev,
            attendance: {
                ...prev.attendance,
                [memberId]: !prev.attendance[memberId]
            }
        }));
    };

    const handleAgendaChange = (agendaId) => {
        // snake_case: agenda_status
        setFormData(prev => ({
            ...prev,
            agenda_status: {
                ...(prev.agenda_status || {}),
                [agendaId]: !(prev.agenda_status?.[agendaId])
            }
        }));
    };

    const handleAddCustomAgenda = () => {
        if (!newCustomAgenda.trim()) return;

        const newAgenda = {
            id: `custom_${Date.now()}`,
            label: newCustomAgenda.trim()
        };

        setFormData(prev => ({
            ...prev,
            custom_agendas: [...(prev.custom_agendas || []), newAgenda],
            agenda_status: {
                ...(prev.agenda_status || {}),
                [newAgenda.id]: true // Add as checked by default since user explicitly takes it
            }
        }));

        setNewCustomAgenda('');
    };

    const handleRemoveCustomAgenda = (idToRemove) => {
        setFormData(prev => {
            const updatedCustomAgendas = (prev.custom_agendas || []).filter(item => item.id !== idToRemove);
            const updatedAgendaStatus = { ...prev.agenda_status };
            delete updatedAgendaStatus[idToRemove];

            return {
                ...prev,
                custom_agendas: updatedCustomAgendas,
                agenda_status: updatedAgendaStatus
            };
        });
    };

    const handleStatusChange = (newStatus) => {
        setFormData(prev => ({
            ...prev,
            status: newStatus,
            // Clear reason if switching away from cancelled? 
            // Or keep it. User said "ask for reason".
        }));
    };

    const handleReasonChange = (reason) => {
        setFormData(prev => ({ ...prev, cancelled_reason: reason }));
    };

    const saveChanges = () => {
        updateMeeting(meeting.id, formData);
        navigate(-1); // Go back
    };

    const toggleManageMembers = () => {
        if (isManagingMembers) {
            // Save members when done
            updateHalqaMembers(halqa.id, editedMembers);
        }
        setIsManagingMembers(!isManagingMembers);
    };

    const handleMemberNameChange = (memberId, newName) => {
        setEditedMembers(prev => prev.map(m => m.id === memberId ? { ...m, name: newName } : m));
    };

    const removeMember = (memberId) => {
        setEditedMembers(prev => prev.filter(m => m.id !== memberId));
    };

    const addMember = () => {
        const newMember = {
            id: `m-${Date.now()}`,
            name: ''
        };
        setEditedMembers(prev => [...prev, newMember]);
    };

    const attendanceCount = Object.values(formData.attendance || {}).filter(Boolean).length;
    // halqas might have string members or json members? SB uses JSONB.
    const totalMembers = halqa.members ? halqa.members.length : 0;

    // Determine Agenda Layout based on Week Number
    let defaultAgendaWeek = 1;
    if (meeting.week_start_date) {
        defaultAgendaWeek = getCustomWeekDetails(meeting.week_start_date).weekNumber;
    }
    const agendaWeek = formData.custom_agenda_week || defaultAgendaWeek;
    const currentAgenda = WEEKLY_AGENDAS[agendaWeek] || WEEKLY_AGENDAS[1];

    const agendaCount = Object.values(formData.agenda_status || {}).filter(Boolean).length;
    const totalAgenda = currentAgenda.length + (formData.custom_agendas ? formData.custom_agendas.length : 0);

    return (
        <div className="meeting-editor">
            <div className="editor-header">
                <div>
                    <button onClick={() => navigate(-1)} className="back-btn-simple">
                        <ChevronLeft size={16} /> Cancel
                    </button>
                    <h1 className="text-display text-4xl mt-4">{halqa.name}</h1>
                    <div className="text-secondary text-sm uppercase tracking-widest mt-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span>Week of {meeting.week_start_date}</span>
                        <span>&bull;</span>
                        {isEditingType ? (
                            <select
                                className="admin-input"
                                style={{ padding: '0.2rem 0.5rem', width: 'auto', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                value={agendaWeek}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, custom_agenda_week: parseInt(e.target.value) }));
                                    setIsEditingType(false);
                                }}
                                onBlur={() => setIsEditingType(false)}
                                autoFocus
                            >
                                {[1, 2, 3, 4, 5].map(w => (
                                    <option key={w} value={w}>{HALQA_MEETING_NAMES[w]}</option>
                                ))}
                            </select>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{HALQA_MEETING_NAMES[agendaWeek]}</span>
                                <button onClick={() => setIsEditingType(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
                                    <Edit3 size={14} />
                                </button>
                            </span>
                        )}
                    </div>
                </div>
                <button className="btn-save" onClick={saveChanges}>
                    <Save size={16} /> SAVE REPORT
                </button>
            </div>

            <div className="editor-section">
                <h2 className="section-title">MEETING STATUS</h2>
                <div className="status-toggles">
                    {['completed', 'pending', 'cancelled'].map(status => (
                        <button
                            key={status}
                            className={`status-btn ${formData.status === status ? status : ''}`}
                            onClick={() => handleStatusChange(status)}
                        >
                            {status.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {formData.status === 'cancelled' && (
                <div className="editor-section reason-section">
                    <h2 className="section-title">REASON FOR CANCELLATION</h2>
                    <textarea
                        className="reason-textarea"
                        placeholder="Enter the reason why this meeting was cancelled..."
                        value={formData.cancelled_reason || ''}
                        onChange={(e) => handleReasonChange(e.target.value)}
                    />
                </div>
            )}

            {formData.status !== 'cancelled' && (
                <div className="grid-2-col">
                    <div className="editor-section">
                        <div className="section-header" style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={20} className="text-accent" />
                                <h2 className="section-title">ATTENDANCE</h2>
                                <span className="badge">{attendanceCount}/{totalMembers}</span>
                            </div>
                        </div>

                        <div className="checklist">
                            {halqa.members && halqa.members.map(member => (
                                <label key={member.id} className="checklist-item">
                                    <input
                                        type="checkbox"
                                        checked={!!(formData.attendance && formData.attendance[member.id])}
                                        onChange={() => handleAttendanceChange(member.id)}
                                    />
                                    <span className="item-label">{member.name}</span>
                                </label>
                            ))}
                            {(!halqa.members || halqa.members.length === 0) && (
                                <p className="text-secondary text-sm">No members found.</p>
                            )}
                        </div>
                    </div>

                    <div className="editor-section">
                        <div className="section-header">
                            <Target size={20} className="text-accent" />
                            <h2 className="section-title">AGENDA</h2>
                            <span className="badge">{agendaCount}/{totalAgenda}</span>
                        </div>
                        <div className="checklist">
                            {currentAgenda.map(item => (
                                <label key={item.id} className="checklist-item">
                                    <input
                                        type="checkbox"
                                        checked={!!(formData.agenda_status && formData.agenda_status[item.id])}
                                        onChange={() => handleAgendaChange(item.id)}
                                    />
                                    <span className="item-label">{item.label}</span>
                                </label>
                            ))}
                            {formData.custom_agendas && formData.custom_agendas.map(item => (
                                <label key={item.id} className="checklist-item" style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!(formData.agenda_status && formData.agenda_status[item.id])}
                                        onChange={() => handleAgendaChange(item.id)}
                                    />
                                    <span className="item-label" style={{ flex: 1 }}>
                                        {item.label}
                                        <span style={{ fontSize: '0.7em', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>(Custom)</span>
                                    </span>
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleRemoveCustomAgenda(item.id); }}
                                        style={{ padding: '0.25rem', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        title="Remove agenda"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </label>
                            ))}
                            <div className="add-agenda-section" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <input
                                    type="text"
                                    value={newCustomAgenda}
                                    onChange={(e) => setNewCustomAgenda(e.target.value)}
                                    placeholder="Type new agenda..."
                                    className="admin-input"
                                    style={{ flex: 1, padding: '0.5rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomAgenda()}
                                />
                                <button onClick={handleAddCustomAgenda} className="btn-save" style={{ padding: '0 0.8rem', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Logic for identification of incomplete agendas is implicitly shown by unchecked items */}
            {formData.status === 'completed' && agendaCount < totalAgenda && (
                <div className="warning-box">
                    <strong>Note:</strong> Some agenda items were not completed. Please ensure all mandatory items are covered.
                </div>
            )}
        </div>
    );
};

export default MeetingDetails;
