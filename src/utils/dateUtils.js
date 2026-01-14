
export const getStartOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    // Actually, let's just standardise on Monday as start of week
    // If today is Sunday (0), we want previous Monday (-6).
    // If today is Monday (1), we want today (0).
    // If today is Tuesday (2), we want yesterday (-1).
    // Formula: date - (day - 1) if day != 0. If day == 0, date - 6.

    // Simpler: 
    // const day = d.getDay() || 7; // Sunday is 7
    // d.setHours(0, 0, 0, 0);
    // d.setDate(d.getDate() - day + 1);

    const dayCorrected = d.getDay() || 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - dayCorrected + 1);
    return d;
};

export const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

export const addWeeks = (date, weeks) => {
    const d = new Date(date);
    d.setDate(d.getDate() + weeks * 7);
    return d;
};

export const getWeekDisplay = (startDate) => {
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6);

    const options = { month: 'short', day: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
};
