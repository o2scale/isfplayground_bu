import React from 'react';

const WeeklyCalendar = ({
    currentWeekOffset,
    setCurrentWeekOffset,
    calendarEvents,
    users,
    onEventClick
}) => {
    // Generate calendar days
    const generateCalendarDays = () => {
        const days = [];
        const today = new Date();

        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - startDate.getDay() + (currentWeekOffset * 7));

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dateString = currentDate.toISOString().split('T')[0];
            const dayEvents = calendarEvents.filter(event => event.date === dateString);

            days.push({
                date: currentDate,
                events: dayEvents,
                isCurrentMonth: currentDate.getMonth() === today.getMonth(),
                isToday: currentDate.toDateString() === today.toDateString()
            });
        }

        return days;
    };

    const calendarDays = generateCalendarDays();

    const getEventColor = (type) => {
        switch (type) {
            case 'high': return '#ff6b6b';
            case 'medium': return '#f9cb9c';
            case 'low': return '#a4c2f4';
            case 'visit': return '#8ed1fc';
            case 'medical': return '#ff6b6b';
            case 'training': return '#a4c2f4';
            case 'meeting': return '#f9cb9c';
            case 'event': return '#b19cd9';
            default: return '#8a7bff';
        }
    };

    // Function to get week range text
    const getWeekRangeText = () => {
        if (calendarDays.length === 0) return "";

        const firstDay = calendarDays[0].date;
        const lastDay = calendarDays[calendarDays.length - 1].date;

        const firstMonth = firstDay.toLocaleDateString('en-US', { month: 'short' });
        const lastMonth = lastDay.toLocaleDateString('en-US', { month: 'short' });

        if (firstMonth === lastMonth) {
            return `${firstMonth} ${firstDay.getDate()} - ${lastDay.getDate()}, ${firstDay.getFullYear()}`;
        } else {
            return `${firstMonth} ${firstDay.getDate()} - ${lastMonth} ${lastDay.getDate()}, ${firstDay.getFullYear()}`;
        }
    };

    return (
        <div className="full-calendar">
            <h3>Weekly Calendar</h3>

            {/* Calendar Header */}
            <div className="calendar-header">
                <button
                    onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
                    className="calendar-nav-btn"
                >
                    &lt;
                </button>
                <div>{getWeekRangeText()}</div>
                <button
                    onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
                    className="calendar-nav-btn"
                >
                    &gt;
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
                {/* Day headers */}
                {calendarDays.map((day, index) => (
                    <div
                        key={`header-${index}`}
                        className={`calendar-day-header ${day.isToday ? 'today' : ''}`}
                    >
                        {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                        <div className="day-date">
                            {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                ))}

                {/* Day cells with events */}
                {calendarDays.map((day, index) => (
                    <div key={`cell-${index}`} className="calendar-day-cell">
                        {day.events.length === 0 ? (
                            <div className="no-events">No events</div>
                        ) : (
                            day.events.map(event => (
                                <div
                                    key={event.id}
                                    className="calendar-event"
                                    style={{ backgroundColor: getEventColor(event.type) }}
                                    onClick={() => onEventClick(event)}
                                >
                                    <div className="event-title">{event.title}</div>
                                    <div className="event-time">{event.time}</div>
                                    <div
                                        className="event-status-indicator"
                                        style={{
                                            backgroundColor: event.status === "Confirmed" ? "#4caf50" :
                                                event.status === "Pending" ? "#ff9800" :
                                                    event.status === "Completed" ? "#8a7bff" : "#f44336"
                                        }}
                                    ></div>
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeeklyCalendar;