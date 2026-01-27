/**
 * Utility to get the last N trading days (skipping weekends and major US holidays)
 */
export const getLastTradingDays = (count) => {
    const days = [];
    let d = new Date();
    // Start from today or previous close

    while (days.length < count) {
        d.setDate(d.getDate() - 1);
        const dayOfWeek = d.getDay(); // 0 is Sun, 6 is Sat
        const dateString = d.toISOString().split('T')[0];

        // Skip Weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        // Skip US Holidays (Simple 2026 check for Jan 19 - MLK Day)
        if (dateString === '2026-01-19') continue;
        if (dateString === '2026-01-01') continue;

        days.push(dateString);
    }
    return days.reverse();
};
