import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { WEEKLY_AGENDAS } from '../data/mockData';
import { ChevronLeft, UserCheck, CheckSquare, Save, Users, Target } from 'lucide-react';
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

    const handleStatusChange = (newStatus) => {
        setFormData(prev => ({
            ...prev,
            status: newStatus,
            // Clear reason if switching away from missed? 
            // Or keep it. User said "ask for reason".
        }));
    };

    const handleReasonChange = (reason) => {
        setFormData(prev => ({ ...prev, missed_reason: reason }));
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
    // Calculate week number from the date
    let agendaWeek = 1;
    if (meeting.week_start_date) {
        const date = new Date(meeting.week_start_date);
        // Get ISO week number
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        agendaWeek = ((weekNum - 1) % 5) + 1;
    }
    const currentAgenda = WEEKLY_AGENDAS[agendaWeek] || WEEKLY_AGENDAS[1];

    const agendaCount = Object.values(formData.agenda_status || {}).filter(Boolean).length;
    const totalAgenda = currentAgenda.length;

    return (
        <div className="meeting-editor">
            <div className="editor-header">
                <div>
                    <button onClick={() => navigate(-1)} className="back-btn-simple">
                        <ChevronLeft size={16} /> Cancel
                    </button>
                    <h1 className="text-display text-4xl mt-4">{halqa.name}</h1>
                    <p className="text-secondary text-sm uppercase tracking-widest mt-1">Week of {meeting.week_start_date}</p>
                </div>
                <button className="btn-save" onClick={saveChanges}>
                    <Save size={16} /> SAVE REPORT
                </button>
            </div>

            <div className="editor-section">
                <h2 className="section-title">MEETING STATUS</h2>
                <div className="status-toggles">
                    {['completed', 'pending', 'missed'].map(status => (
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

            {formData.status === 'missed' && (
                <div className="editor-section reason-section">
                    <h2 className="section-title">REASON FOR MISSING</h2>
                    <textarea
                        className="reason-textarea"
                        placeholder="Enter the reason why this meeting was missed..."
                        value={formData.missed_reason || ''}
                        onChange={(e) => handleReasonChange(e.target.value)}
                    />
                </div>
            )}

            {formData.status !== 'missed' && (
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
