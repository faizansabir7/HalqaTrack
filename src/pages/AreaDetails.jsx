import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ClipboardList, CheckCircle, XCircle, Clock, ChevronLeft } from 'lucide-react';
import './AreaDetails.css';

const AreaDetails = () => {
    const { areaId } = useParams();
    const { areas, halqas, meetings } = useData();

    const area = areas.find(a => a.id === areaId);

    if (!area) return <div className="container" style={{ padding: '2rem' }}>Area not found</div>;

    const areaHalqas = halqas.filter(h => h.area_id === areaId);

    // Get current meeting for each halqa
    const getMeeting = (halqaId) => meetings.find(m => m.halqa_id === halqaId);

    // Handler for "Manage" click - if meeting doesn't exist, we'll need to create it eventually.
    // However, the MeetingDetails page will handle lazy creation/fetching.
    // For now, we link to a "virtual" meeting ID if it doesn't exist? 
    // Problem: routing uses /meeting/:id
    // If meeting doesn't exist, we don't have an ID.
    // SOLUTION: Use /meeting/halqa/:halqaId and let the MeetingDetails page resolve the meeting for the current week.
    // OR: Create the meeting when the user clicks "Manage" here?
    // Let's create it on click (Async) or change route.
    // Changing route to /manage/:halqaId might be cleaner for "weekly" logic.
    // But refactoring routes is big.
    // Let's stick to: If meeting exists, use its ID. If not, we can't link to an ID.

    // Better approach: Since we want to support "This Week", and we are lazy creating.
    // We should probably have a special route like `/halqa/:halqaId/meeting` which finds the current week meeting.
    // But let's try to stick to the existing route structure if possible.
    // Modify: "Manage" button calls `getOrCreateMeeting` then navigates? 
    // No, that's slow UI.

    // Let's change the route in App.jsx? No, that's out of scope/risky.
    // Let's assume standard behavior: We need to find the meeting.
    // If it's undefined, we can't link to `/meeting/undefined`.
    // Let's use a wrapper component or just create it when we click?

    // HACK for now: We won't link to /meeting/:id. We will link to /meeting-manager/:halqaId 
    // and update the Router?

    // OR: We just generate a deterministic ID? No.
    // OR: We make the "Manage" button a real button that calls `create` if needed.

    // Let's go with the button approach.

    return (
        <div className="area-details">
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/" className="back-link">
                    <ChevronLeft size={20} />
                    Back to Dashboard
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <div className="area-badge" style={{ backgroundColor: area.color }}></div>
                    <h1 className="text-2xl">{area.name} Overview</h1>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-header">
                    <div className="col-name">Halqa Name</div>
                    <div className="col-day">Day</div>
                    <div className="col-status">Status</div>
                    <div className="col-action">Action</div>
                </div>

                <div className="table-body">
                    {areaHalqas.map(halqa => {
                        const meeting = getMeeting(halqa.id);
                        return (
                            <div key={halqa.id} className="table-row">
                                <div className="col-name">
                                    <span style={{ fontWeight: 500 }}>{halqa.name}</span>
                                    <div className="mobile-label text-secondary text-sm">
                                        {meeting?.status || 'pending'}
                                    </div>
                                </div>
                                <div className="col-day text-secondary">{halqa.meeting_day || halqa.meetingDay}</div>
                                <div className="col-status">
                                    <StatusBadge status={meeting?.status || 'pending'} />
                                </div>
                                <div className="col-action">
                                    <ManageButton halqaId={halqa.id} existingMeetingId={meeting?.id} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const ManageButton = ({ halqaId, existingMeetingId }) => {
    const { getOrCreateMeeting } = useData();
    const [loading, setLoading] = React.useState(false);
    const navigate = import.meta.env.VITE_ROUTER_NAVIGATE || ((path) => window.location.hash = path);
    // Wait, I can't easily get navigate hook here without refactoring.
    // But I can use Link if existingMeetingId is present.
    // If not, I need a button.

    // Actually, I can use useNavigate inside this component if I import it.

    // Let's do that.
    return (
        <ManageButtonInner halqaId={halqaId} existingMeetingId={existingMeetingId} />
    )
}

import { useNavigate } from 'react-router-dom';

const ManageButtonInner = ({ halqaId, existingMeetingId }) => {
    const navigate = useNavigate();
    const { getOrCreateMeeting } = useData();
    const [isCreating, setIsCreating] = React.useState(false);
    const [error, setError] = React.useState(null);

    const handleClick = async () => {
        if (existingMeetingId) {
            navigate(`/meeting/${existingMeetingId}`);
        } else {
            try {
                setIsCreating(true);
                setError(null);
                const m = await getOrCreateMeeting(halqaId);
                if (m && m.id) {
                    // Add a small delay to ensure state propagates before navigation
                    setTimeout(() => {
                        navigate(`/meeting/${m.id}`);
                    }, 100);
                } else {
                    setError('Failed to create meeting');
                    console.error('getOrCreateMeeting returned null or invalid meeting');
                    setIsCreating(false);
                }
            } catch (err) {
                setError('Error creating meeting');
                console.error('Error in handleClick:', err);
                setIsCreating(false);
            }
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isCreating}
            className="btn-action"
            style={{ 
                border: 'none', 
                cursor: isCreating ? 'wait' : 'pointer', 
                opacity: isCreating ? 0.7 : 1,
                color: error ? 'var(--color-danger)' : 'inherit'
            }}
            title={error || ''}
        >
            {isCreating ? '...' : error ? 'Retry' : 'Manage'}
        </button>
    );
};

const StatusBadge = ({ status }) => {
    const config = {
        completed: { color: 'var(--color-success)', icon: CheckCircle, label: 'Completed' },
        missed: { color: 'var(--color-danger)', icon: XCircle, label: 'Missed' },
        pending: { color: 'var(--color-warning)', icon: Clock, label: 'Pending' }
    };

    const { color, icon: Icon, label } = config[status] || config.pending;

    return (
        <span className="status-badge" style={{ borderColor: color, color: color }}>
            <Icon size={14} />
            {label}
        </span>
    );
};

export default AreaDetails;
