// Custom Week Logic for Halqa Tracker

export const HALQA_MEETING_NAMES = {
    1: "Thazkiya Halqa",
    2: "Prasthana Halqa",
    3: "Pothu Halqa",
    4: "Thahreeki Halqa",
    5: "Sargga Halqa"
};

export const getCustomWeekDetails = (dateInput = new Date()) => {
    const date = new Date(dateInput);
    const dayOfMonth = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    let weekNumber;
    let startDateDay;
    let endDateDay;

    if (dayOfMonth <= 7) {
        weekNumber = 1;
        startDateDay = 1;
        endDateDay = 7;
    } else if (dayOfMonth <= 14) {
        weekNumber = 2;
        startDateDay = 8;
        endDateDay = 14;
    } else if (dayOfMonth <= 21) {
        weekNumber = 3;
        startDateDay = 15;
        endDateDay = 21;
    } else if (dayOfMonth <= 28) {
        weekNumber = 4;
        startDateDay = 22;
        endDateDay = 28;
    } else {
        weekNumber = 5;
        startDateDay = 29;
        // Last day of month
        endDateDay = new Date(year, month + 1, 0).getDate();
    }

    const startDate = new Date(year, month, startDateDay);
    const endDate = new Date(year, month, endDateDay);

    // Normalize to midnight
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return {
        weekNumber,
        startDate,
        endDate,
        meetingName: HALQA_MEETING_NAMES[weekNumber],
        isWeek5: weekNumber === 5
    };
};

export const navigateCustomWeek = (currentStartDate, offset) => {
    const current = getCustomWeekDetails(currentStartDate);
    const date = new Date(current.startDate);

    // Determine new date roughly by adding/subtracting 7 days, then checking rules

    if (offset > 0) {
        // Go forward
        if (current.weekNumber === 4) {
            // Check if month has week 5
            const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
            if (lastDayOfMonth > 28) {
                // Determine start of week 5
                return new Date(date.getFullYear(), date.getMonth(), 29);
            } else {
                // Skip to Next Month Week 1
                return new Date(date.getFullYear(), date.getMonth() + 1, 1);
            }
        } else if (current.weekNumber === 5) {
            // Always go to Next Month Week 1
            return new Date(date.getFullYear(), date.getMonth() + 1, 1);
        } else {
            // Week 1, 2, 3 -> Just add 7 days (1->8, 8->15, 15->22)
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
        }
    } else {
        // Go backward
        if (current.weekNumber === 1) {
            // Go to prev month
            const prevMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 1); // 1st of prev month
            const lastDayOfPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

            // If prev month has > 28 days, it has Week 5. Start date is 29.
            if (lastDayOfPrevMonth > 28) {
                return new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 29);
            } else {
                // Else it ends at Week 4. Start date is 22.
                return new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 22);
            }
        } else if (current.weekNumber === 5) {
            // Week 5 -> Week 4 (Always starts 22)
            return new Date(date.getFullYear(), date.getMonth(), 22);
        } else {
            // Week 4, 3, 2 -> Just subtract 7 days
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
        }
    }
};

export const getStartOfWeek = (date = new Date()) => {
    // Adapter to match existing codebase usage: returns strict Start Date of Custom Week
    return getCustomWeekDetails(date).startDate;
};

export const formatDate = (date) => {
    const d = new Date(date);
    // Use local YYYY-MM-DD
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const addWeeks = (date, weeks) => {
    // Adapter using navigation logic
    let newDate = new Date(date);
    if (weeks > 0) {
        for (let i = 0; i < weeks; i++) {
            newDate = navigateCustomWeek(newDate, 1);
        }
    } else {
        for (let i = 0; i < Math.abs(weeks); i++) {
            newDate = navigateCustomWeek(newDate, -1);
        }
    }
    return newDate;
};

export const getWeekDisplay = (startDate) => {
    const details = getCustomWeekDetails(startDate);
    const end = details.endDate;

    const startOptions = { month: 'short', day: 'numeric' };
    const endOptions = { month: 'short', day: 'numeric', year: 'numeric' };

    if (startDate.getFullYear() !== end.getFullYear()) {
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', endOptions)}`;
    }

    return `${startDate.toLocaleDateString('en-US', startOptions)} - ${end.toLocaleDateString('en-US', endOptions)}`;
};
