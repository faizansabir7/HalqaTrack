import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getStartOfWeek, formatDate, addWeeks } from '../utils/dateUtils';
import { MOCK_HALQAS, AREAS } from '../data/mockData'; // Fallback / Initial Seed info

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [areas, setAreas] = useState([]);
    const [halqas, setHalqas] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
    const [loading, setLoading] = useState(true);

    // Fetch Areas and Halqas on mount
    useEffect(() => {
        const fetchStaticData = async () => {
            try {
                // Fetch Areas
                const { data: areasData, error: areasError } = await supabase.from('areas').select('*');
                if (areasError) throw areasError;

                // Fetch Halqas
                const { data: halqasData, error: halqasError } = await supabase.from('halqas').select('*');
                if (halqasError) throw halqasError;

                if (areasData && areasData.length > 0) {
                    setAreas(areasData);
                } else {
                    // Fallback for dev: If DB empty, we might return empty or handle seeding elsewhere
                    // For now, let's keep it empty to encourage DB setup
                    console.log('No areas found in DB');
                }

                if (halqasData && halqasData.length > 0) {
                    setHalqas(halqasData);
                }
            } catch (error) {
                console.error('Error fetching static data:', error);
            }
        };

        fetchStaticData();
    }, []);

    // Fetch Meetings when currentWeekStart changes
    useEffect(() => {
        const fetchMeetings = async () => {
            setLoading(true);
            try {
                const dateStr = formatDate(currentWeekStart);
                const { data, error } = await supabase
                    .from('meetings')
                    .select('*')
                    .eq('week_start_date', dateStr);

                if (error) throw error;

                setMeetings(data || []);
            } catch (error) {
                console.error('Error fetching meetings:', error);
            } finally {
                setLoading(false);
            }
        };

        if (halqas.length > 0) {
            fetchMeetings();
        } else {
            // If we have no halqas, we can't have meetings, so we are done loading
            setLoading(false);
        }
    }, [currentWeekStart, halqas]); // Refetch if week changes or halqas load

    const changeWeek = (offset) => {
        setCurrentWeekStart(prev => addWeeks(prev, offset));
    };

    const goToToday = () => {
        setCurrentWeekStart(getStartOfWeek(new Date()));
    };

    const updateMeeting = async (meetingId, updates) => {
        // Optimistic update
        setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, ...updates } : m));

        try {
            const { error } = await supabase
                .from('meetings')
                .update(updates)
                .eq('id', meetingId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating meeting:', error);
            // Revert on error (implementation skipped for brevity)
        }
    };

    const updateHalqaMembers = async (halqaId, newMembers) => {
        // Optimistic update
        setHalqas(prev => prev.map(h => h.id === halqaId ? { ...h, members: newMembers } : h));

        try {
            const { error } = await supabase
                .from('halqas')
                .update({ members: newMembers })
                .eq('id', halqaId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating halqa members:', error);
            // Revert logic would go here
        }
    };

    const addHalqa = async (areaId, name) => {
        const newHalqa = {
            id: `h-${Date.now()}`, // Temporary ID for optimistic UI
            area_id: areaId,
            name: name,
            meeting_day: 'Thursday',
            members: []
        };

        setHalqas(prev => [...prev, newHalqa]);

        try {
            // Remove ID so DB generates a real UUID if setup
            const { id, ...halqaNoId } = newHalqa;
            const { data, error } = await supabase
                .from('halqas')
                .insert([{ ...halqaNoId }]) // or keep ID if we want client-side IDs? Better let DB handle it.
                .select()
                .single();

            if (error) throw error;

            // Update local state with real DB data (real ID)
            setHalqas(prev => prev.map(h => h.id === newHalqa.id ? data : h));
        } catch (error) {
            console.error('Error adding halqa:', error);
            // Revert
            setHalqas(prev => prev.filter(h => h.id !== newHalqa.id));
        }
    };

    const updateHalqaName = async (halqaId, newName) => {
        setHalqas(prev => prev.map(h => h.id === halqaId ? { ...h, name: newName } : h));

        try {
            const { error } = await supabase
                .from('halqas')
                .update({ name: newName })
                .eq('id', halqaId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating halqa name:', error);
        }
    };

    const deleteHalqa = async (halqaId) => {
        setHalqas(prev => prev.filter(h => h.id !== halqaId));

        try {
            const { error } = await supabase
                .from('halqas')
                .delete()
                .eq('id', halqaId);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting halqa:', error);
            // Revert fetch?
        }
    };

    // Helper to Create/Get meeting for a halqa for the current week
    // If it doesn't exist in 'meetings' array, we might want to create it?
    // In this Architecture, we'll auto-generate "pending" meetings on the fly if they don't exist in DB?
    // OR we insert them when we fetch if missing.
    // Let's go with: "On Dashboard render, if meeting missing for Halqa, show as Pending (Virtual)".
    // Real creation happens when user clicks "Manage".

    const getOrCreateMeeting = async (halqaId) => {
        const existing = meetings.find(m => m.halqa_id === halqaId); // DB uses snake_case: halqa_id
        if (existing) return existing;

        // If not found, create a new row
        const newMeeting = {
            halqa_id: halqaId,
            week_start_date: formatDate(currentWeekStart),
            status: 'pending',
            attendance: {},
            agenda_status: {}
        };

        try {
            const { data, error } = await supabase
                .from('meetings')
                .insert([newMeeting])
                .select()
                .single();

            if (error) throw error;

            setMeetings(prev => [...prev, data]);
            return data;
        } catch (error) {
            console.error('Error creating meeting:', error);
            return null;
        }
    };

    const getAreaStats = (areaId) => {
        const areaHalqaIds = halqas.filter(h => h.area_id === areaId).map(h => h.id); // DB snake_case: area_id
        const areaMeetings = meetings.filter(m => areaHalqaIds.includes(m.halqa_id));

        // We only count meetings that exist. 
        // MISSING meetings (not in DB yet) are conceptually "pending".
        // Total should be number of Halqas in the area.

        const total = areaHalqaIds.length;
        const completed = areaMeetings.filter(m => m.status === 'completed').length;
        const missed = areaMeetings.filter(m => m.status === 'missed').length;
        // Pending = Total - Completed - Missed
        const pending = total - completed - missed;

        return { total, completed, missed, pending };
    };

    const seedDatabase = async () => {
        // Simple seed function to populate Areas and Halqas from mockData if empty
        // NOTE: This will create new UUIDs, so be careful.
        console.log('Seeding Database...');

        // 1. Insert Areas
        for (const area of AREAS) {
            const { data: areaData, error } = await supabase.from('areas').insert([{ name: area.name, color: area.color }]).select().single();
            if (error) { console.error(error); continue; }

            // 2. Insert Halqas for this area
            // Find mock halqas for this area
            const mockHalqasForArea = MOCK_HALQAS.filter(h => h.areaId === area.id);

            for (const h of mockHalqasForArea) {
                await supabase.from('halqas').insert([{
                    area_id: areaData.id,
                    name: h.name,
                    meeting_day: h.meetingDay,
                    members: h.members
                }]);
            }
        }
        console.log('Seeding Complete. Refreshing...');
        window.location.reload();
    };

    return (
        <DataContext.Provider value={{
            areas,
            halqas,
            meetings,
            currentWeekStart,
            loading,
            updateMeeting,
            getAreaStats,
            changeWeek,
            goToToday,
            getOrCreateMeeting,
            seedDatabase,
            updateHalqaMembers,
            addHalqa,
            updateHalqaName,
            deleteHalqa
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
};
