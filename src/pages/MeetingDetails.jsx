import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { WEEKLY_AGENDAS } from '../data/mockData';
import { ChevronLeft, UserCheck, CheckSquare, Save, Users, Target, Trash2, Plus, X, Edit2 } from 'lucide-react';
import './MeetingDetails.css';

const MeetingDetails = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();
    const { meetings, halqas, updateMeeting, updateHalqaMembers } = useData();

    // Find data
    const meeting = meetings.find(m => m.id === meetingId);

    // Local state
    const [formData, setFormData] = useState(null);
    const [halqa, setHalqa] = useState(null);
    const [waitingForMeeting, setWaitingForMeeting] = useState(true);
    const [isManagingMembers, setIsManagingMembers] = useState(false);
    const [editedMembers, setEditedMembers] = useState([]);

    useEffect(() => {
        if (meeting) {
            setFormData(meeting);
            const h = halqas.find(x => x.id === meeting.halqa_id);
            if (h) {
                setHalqa(h);
                setEditedMembers(h.members || []);
            }
            setWaitingForMeeting(false);
        } else {
            // If meeting not found, wait a bit for state to propagate
            const timer = setTimeout(() => {
                setWaitingForMeeting(false);
            }, 2000); // Wait 2 seconds before showing "not found"
            
            return () => clearTimeout(timer);
        }
    }, [meeting, halqas]);

    // Handle Loading State
    if (!meeting || !formData || !halqa) {
        console.log('MeetingDetails Debug:', {
            meetingId,
            hasMeeting: !!meeting,
            hasFormData: !!formData,
            hasHalqa: !!halqa,
            totalMeetings: meetings.length,
            totalHalqas: halqas.length,
            waitingForMeeting
        });

        return (
            <div className="container p-8 text-center" style={{ paddingTop: '30vh' }}>
                <div style={{ marginBottom: '1rem', fontSize: '2rem', fontFamily: 'var(--font-display)' }}>
                    {waitingForMeeting ? 'LOADING...' : (!meeting ? 'MEETING NOT FOUND' : 'LOADING...')}
                </div>
                <p className="text-secondary">
                    {waitingForMeeting && 'Please wait while the meeting is being prepared...'}
                    {!waitingForMeeting && !meeting && 'The meeting could not be loaded.'}
                    {!waitingForMeeting && meeting && !halqa && 'Loading Halqa details...'}
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
        setFormData(prev => ({ ...prev, status: newStatus }));
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

            <div className="grid-2-col">
                <div className="editor-section">
                    <div className="section-header" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={20} className="text-accent" />
                            <h2 className="section-title">ATTENDANCE</h2>
                            {!isManagingMembers && <span className="badge">{attendanceCount}/{totalMembers}</span>}
                        </div>
                        <button
                            className="text-xs text-secondary hover:text-white"
                            onClick={toggleManageMembers}
                            style={{ textDecoration: 'underline', cursor: 'pointer', background: 'none', padding: 0 }}
                        >
                            {isManagingMembers ? 'DONE' : 'MANAGE MEMBERS'}
                        </button>
                    </div>

                    {isManagingMembers ? (
                        <div className="members-editor">
                            {editedMembers.map(member => (
                                <div key={member.id} className="member-edit-row">
                                    <input
                                        type="text"
                                        value={member.name}
                                        onChange={(e) => handleMemberNameChange(member.id, e.target.value)}
                                        placeholder="Member Name"
                                        className="member-input"
                                    />
                                    <button onClick={() => removeMember(member.id)} className="btn-icon-danger">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <button onClick={addMember} className="btn-add-member">
                                <Plus size={16} /> Add Member
                            </button>
                        </div>
                    ) : (
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
                        </div>
                    )}
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
