// Patch to replace guide.html getEpisodeForDate with occurrence-counting logic
// This mirrors the tv.js implementation to avoid phantom episodes

function getDayIndexFromName(dayName) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(dayName);
}

function getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

function timeToMinutes(timeStr) {
    const m = String(timeStr || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let hour = parseInt(m[1], 10);
    const minute = parseInt(m[2], 10);
    const ampm = m[3].toUpperCase();
    if (hour === 12) hour = 0;
    if (ampm === 'PM') hour += 12;
    return hour * 60 + minute;
}

function getProgramOccurrencesForDay(program, dayName, weeklyLineup) {
    if (!weeklyLineup || !dayName) return [];
    const slots = weeklyLineup.filter(s => s.day === dayName && s.program === program);
    return slots
        .map(s => timeToMinutes(s.time))
        .filter(m => m !== null)
        .sort((a, b) => a - b);
}

function getProgramWeeklyCount(program, weeklyLineup) {
    if (!weeklyLineup || !program) return 0;
    let total = 0;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (const dayName of days) {
        total += getProgramOccurrencesForDay(program, dayName, weeklyLineup).length;
    }
    return total;
}

function getProgramOccurrenceIndex(program, timeStr, date, weeklyLineup, scheduleStartDate) {
    if (!program || !timeStr || !date || !weeklyLineup || !scheduleStartDate) return 0;

    const slotStartMin = timeToMinutes(timeStr);
    if (slotStartMin === null) return 0;

    const slotStart = new Date(date);
    slotStart.setHours(0, 0, 0, 0);
    slotStart.setMinutes(slotStartMin);

    const scheduleStart = new Date(scheduleStartDate + 'T00:00:00');
    const scheduleDayStart = new Date(scheduleStart);
    scheduleDayStart.setHours(0, 0, 0, 0);

    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const daysDiff = Math.floor((slotStart - scheduleDayStart) / MS_PER_DAY);
    if (daysDiff < 0) return 0;

    const weeklyCount = getProgramWeeklyCount(program, weeklyLineup);
    if (weeklyCount <= 0) return 0;

    // Whole weeks between anchor and current
    const wholeWeeks = Math.floor(daysDiff / 7);
    let total = wholeWeeks * weeklyCount;

    // Partial week days
    const remDays = daysDiff % 7;
    for (let i = 0; i < remDays; i++) {
        const d = new Date(scheduleDayStart.getTime() + ((wholeWeeks * 7 + i) * MS_PER_DAY));
        const dayName = getDayName(d);
        total += getProgramOccurrencesForDay(program, dayName, weeklyLineup).length;
    }

    // Current day: count slots strictly before this one
    const currentDayName = getDayName(slotStart);
    const starts = getProgramOccurrencesForDay(program, currentDayName, weeklyLineup);
    for (const sMin of starts) {
        if (sMin < slotStartMin) total += 1;
    }

    return total;
}

// New getEpisodeForDate for guide.html
function getEpisodeForDate(date, timeStr, program) {
    // Use occurrence counting if we have the data
    if (typeof weeklyLineup !== 'undefined' && typeof scheduleStartDate !== 'undefined') {
        const occ = getProgramOccurrenceIndex(program, timeStr, date, weeklyLineup, scheduleStartDate);
        
        // Look up actual episode counts from schedule.json if available
        // For now, fall back to reasonable defaults that match existing content
        let episodeCount;
        let seasonCount = 1;
        
        // These counts should reflect what's actually in schedule.json
        const knownCounts = {
            "Dexter's Laboratory": { episodes: 20, seasons: 2 },
            "The Powerpuff Girls": { episodes: 20, seasons: 2 },
            "Ed, Edd n Eddy": { episodes: 20, seasons: 1 },
            "Space Ghost Coast to Coast": { episodes: 18, seasons: 1 },
            "Aqua Teen Hunger Force": { episodes: 18, seasons: 1 }
        };
        
        if (knownCounts[program]) {
            episodeCount = knownCounts[program].episodes;
            seasonCount = knownCounts[program].seasons;
        } else {
            episodeCount = 15; // Default fallback
        }
        
        const episodeIndex = ((occ % episodeCount) + episodeCount) % episodeCount;
        const episodeNum = episodeIndex + 1;
        
        // Determine season for multi-season shows
        let season = 1;
        if (program === "Dexter's Laboratory" || program === "The Powerpuff Girls") {
            season = (episodeNum <= 13) ? 1 : 2;
        }
        
        return { episode: episodeNum, season };
    }
    
    // Fallback to simple math if data not available
    return { episode: 1, season: 1 };
}
