export const AREAS = [
    { id: 'north', name: 'North Area', color: 'var(--area-north)' },
    { id: 'south', name: 'South Area', color: 'var(--area-south)' },
    { id: 'east', name: 'East Area', color: 'var(--area-east)' },
    { id: 'west', name: 'West Area', color: 'var(--area-west)' },
];

export const WEEKLY_AGENDAS = {
    1: [
        { id: 'quran', label: 'Quran/Hadees Class' },
        { id: 'aamugam', label: 'Aamugam' },
        { id: 'report', label: 'Report' },
        { id: 'thazkiya', label: 'Thazkiya Session' },
        { id: 'target_eval', label: 'Meekhathi Mansooba Target Evaluation' },
        { id: 'discussion', label: 'Discussion' },
        { id: 'ulbodanam', label: 'Ulbodanam & Dua' }
    ],
    2: [
        { id: 'quran', label: 'Quran/Hadees Class' },
        { id: 'aamugam', label: 'Aamugam' },
        { id: 'report', label: 'Report' },
        { id: 'prasthanam', label: 'Prasthanam Padana Session' },
        { id: 'discussion', label: 'Discussion' },
        { id: 'ulbodanam', label: 'Ulbodanam & Dua' }
    ],
    3: [
        { id: 'quran', label: 'Quran/Hadees Class' },
        { id: 'aamugam', label: 'Aamugam' },
        { id: 'report', label: 'Report' },
        { id: 'pothu', label: 'Pothu Class' },
        { id: 'discussion', label: 'Discussion' },
        { id: 'ulbodanam', label: 'Ulbodanam & Dua' }
    ],
    4: [
        { id: 'quran', label: 'Quran/Hadees Class' },
        { id: 'aamugam', label: 'Aamugam' },
        { id: 'report', label: 'Report' },
        { id: 'wing_eval', label: 'Evaluation of Wings/Depts' },
        { id: 'discussion', label: 'Discussion' },
        { id: 'ulbodanam', label: 'Ulbodanam & Dua' }
    ],
    5: [
        { id: 'quran', label: 'Quran/Hadees Class' },
        { id: 'aamugam', label: 'Aamugam' },
        { id: 'report', label: 'Report' },
        { id: 'sargga', label: 'Sargga Paripadikal' },
        { id: 'discussion', label: 'Discussion' },
        { id: 'ulbodanam', label: 'Ulbodanam & Dua' }
    ]
};

// Helper to generate random members for the valid Halqas
const generateMembers = (halqaId) => {
    // Generate 5-8 members per halqa
    const count = Math.floor(Math.random() * 4) + 5;
    const members = [];
    for (let i = 0; i < count; i++) {
        members.push({
            id: `m-${halqaId}-${i}`,
            name: `Member ${i + 1}`,
            halqaId: halqaId
        });
    }
    return members;
};

export const MOCK_HALQAS = [
    // BLR SOUTH
    { id: 'h-1', name: 'BLR SOUTH-Bannerghatta Gents Halqa', areaId: 'south', meetingDay: 'Thursday', members: generateMembers('h-1') },
    { id: 'h-2', name: 'BLR SOUTH-Bannerghatta Ladies Halqa', areaId: 'south', meetingDay: 'Thursday', members: generateMembers('h-2') },
    { id: 'h-3', name: 'BLR SOUTH-Electronic City Gents Halqa', areaId: 'south', meetingDay: 'Thursday', members: generateMembers('h-3') },
    { id: 'h-4', name: 'BLR SOUTH-Electronic City Ladies Halqa', areaId: 'south', meetingDay: 'Thursday', members: generateMembers('h-4') },
    { id: 'h-5', name: 'BLR SOUTH-Koramangala Ladies Halqa', areaId: 'south', meetingDay: 'Thursday', members: generateMembers('h-5') },
    { id: 'h-6', name: 'BLR SOUTH-Madiwala Gents Halqa', areaId: 'south', meetingDay: 'Thursday', members: generateMembers('h-6') },

    // BLR EAST
    { id: 'h-7', name: 'BLR EAST-Bellandur Gents Halqa', areaId: 'east', meetingDay: 'Thursday', members: generateMembers('h-7') },
    { id: 'h-8', name: 'BLR EAST-Bellandur Ladies Halqa', areaId: 'east', meetingDay: 'Thursday', members: generateMembers('h-8') },
    { id: 'h-9', name: 'BLR EAST-Kagadasapura Gents Halqa', areaId: 'east', meetingDay: 'Thursday', members: generateMembers('h-9') },
    { id: 'h-10', name: 'BLR EAST-LBS Ladies Halqa', areaId: 'east', meetingDay: 'Thursday', members: generateMembers('h-10') },
    { id: 'h-11', name: 'BLR EAST-Mahadevapura Gents Halqa', areaId: 'east', meetingDay: 'Thursday', members: generateMembers('h-11') },
    { id: 'h-12', name: 'BLR EAST-Mahadevapura Ladies Halqa', areaId: 'east', meetingDay: 'Thursday', members: generateMembers('h-12') },
    { id: 'h-13', name: 'BLR EAST-Marathahalli Gents Halqa', areaId: 'east', meetingDay: 'Thursday', members: generateMembers('h-13') },
    { id: 'h-14', name: 'BLR EAST-Sarjapura Gents Halqa', areaId: 'east', meetingDay: 'Thursday', members: generateMembers('h-14') },
    { id: 'h-15', name: 'BLR EAST-Sarjapura Ladies Halqa', areaId: 'east', meetingDay: 'Thursday', members: generateMembers('h-15') },
    { id: 'h-16', name: 'BLR EAST-Vignan Nagar Ladies Halqa', areaId: 'east', meetingDay: 'Thursday', members: generateMembers('h-16') },
    { id: 'h-17', name: 'BLR EAST-Whitefield Gents Halqa', areaId: 'east', meetingDay: 'Thursday', members: generateMembers('h-17') },
    { id: 'h-18', name: 'BLR EAST-Whitefield Ladies Halqa', areaId: 'east', meetingDay: 'Thursday', members: generateMembers('h-18') },

    // BLR WEST
    { id: 'h-19', name: 'BLR WEST-Kengeri Gents Halqa', areaId: 'west', meetingDay: 'Thursday', members: generateMembers('h-19') },
    { id: 'h-20', name: 'BLR WEST-Kengeri Ladies Halqa', areaId: 'west', meetingDay: 'Thursday', members: generateMembers('h-20') },
    { id: 'h-21', name: 'BLR WEST-Majestic Ladies Halqa', areaId: 'west', meetingDay: 'Thursday', members: generateMembers('h-21') },
    { id: 'h-22', name: 'BLR WEST-Nagarbhavi Gents Halqa', areaId: 'west', meetingDay: 'Thursday', members: generateMembers('h-22') },
    { id: 'h-23', name: 'BLR WEST-Nagarbhavi Ladies Halqa', areaId: 'west', meetingDay: 'Thursday', members: generateMembers('h-23') },

    // BLR NORTH
    { id: 'h-24', name: 'BLR NORTH-Banaswadi Gents Halqa', areaId: 'north', meetingDay: 'Thursday', members: generateMembers('h-24') },
    { id: 'h-25', name: 'BLR NORTH-BEL Road Gents Halqa', areaId: 'north', meetingDay: 'Thursday', members: generateMembers('h-25') },
    { id: 'h-26', name: 'BLR NORTH-BEL Road Ladies Halqa', areaId: 'north', meetingDay: 'Thursday', members: generateMembers('h-26') },
    { id: 'h-27', name: 'BLR NORTH-Coles Park Gents Halqa', areaId: 'north', meetingDay: 'Thursday', members: generateMembers('h-27') },
    { id: 'h-28', name: 'BLR NORTH-Coles Park Ladies Halqa', areaId: 'north', meetingDay: 'Thursday', members: generateMembers('h-28') },
    { id: 'h-29', name: 'BLR NORTH-Hegde Nagar Gents Halqa', areaId: 'north', meetingDay: 'Thursday', members: generateMembers('h-29') },
    { id: 'h-30', name: 'BLR NORTH-Hegde Nagar Ladies Halqa', areaId: 'north', meetingDay: 'Thursday', members: generateMembers('h-30') },
    { id: 'h-31', name: 'BLR NORTH-Kammanahalli Ladies Halqa', areaId: 'north', meetingDay: 'Thursday', members: generateMembers('h-31') },
    { id: 'h-32', name: 'BLR NORTH-RT Nagar Gents Halqa', areaId: 'north', meetingDay: 'Thursday', members: generateMembers('h-32') },
    { id: 'h-33', name: 'BLR NORTH-RT Nagar Ladies Halqa', areaId: 'north', meetingDay: 'Thursday', members: generateMembers('h-33') },
    { id: 'h-34', name: 'BLR NORTH-Yelahanka Gents Halqa', areaId: 'north', meetingDay: 'Thursday', members: generateMembers('h-34') },
];

// Generate initial meetings for the current week?
// Logic: For each Halqa, generate a meeting record for "This Week"
export const generateInitialMeetings = () => {
    return MOCK_HALQAS.map(halqa => ({
        id: `mtg-${halqa.id}-current`,
        halqaId: halqa.id,
        week: '2023-W42', // Placeholder week
        date: new Date().toISOString(),
        status: 'pending', // pending, completed, missed
        attendance: {}, // map memberId -> boolean
        agendaStatus: WEEKLY_AGENDAS[1].reduce((acc, item) => ({ ...acc, [item.id]: false }), {}),
        notes: ''
    }));
};
