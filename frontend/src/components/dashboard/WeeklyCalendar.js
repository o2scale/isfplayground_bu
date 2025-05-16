import React, { useEffect, useState } from 'react';
import './WeeklyCalendar.css'
import { createSchedule, deleteSchedule, fetchUsers, getBalagruha, getBalagruhaListByAssignedID, getSchedules, updateSchedule } from '../../api';
import showToast from '../../utils/toast';

const WeeklyCalendar = ({
    currentWeekOffset,
    setCurrentWeekOffset,
    calendarEvents,
    users,
    fetchSchedules,
    selectedBalagruhaOfCoach,
    onEventClick
}) => {
    // Generate calendar days
    // const generateCalendarDays = () => {
    //     const days = [];
    //     const today = new Date();

    //     const startDate = new Date(today);
    //     startDate.setDate(startDate.getDate() - startDate.getDay() + (currentWeekOffset * 7));

    //     for (let i = 0; i < 7; i++) {
    //         const currentDate = new Date(startDate);
    //         currentDate.setDate(startDate.getDate() + i);

    //         const dateString = currentDate.toISOString().split('T')[0];
    //         const dayEvents = calendarEvents.filter(event => event.date === dateString);

    //         days.push({
    //             date: currentDate,
    //             events: dayEvents,
    //             isCurrentMonth: currentDate.getMonth() === today.getMonth(),
    //             isToday: currentDate.toDateString() === today.toDateString()
    //         });
    //     }

    //     return days;
    // };

    // const generateCalendarDays = () => {
    //     // const days = [];
    //     // const today = new Date();

    //     // const startDate = new Date(today);
    //     // const currentDay = startDate.getDay(); // 0 (Sun) to 6 (Sat)

    //     // // Adjusting so Monday = 0
    //     // const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    //     // startDate.setDate(startDate.getDate() + diffToMonday + currentWeekOffset * 7);

    //     // for (let i = 0; i < 7; i++) {
    //     //     const currentDate = new Date(startDate);
    //     //     currentDate.setDate(startDate.getDate() + i);

    //     //     const dateString = currentDate.toISOString().split('T')[0];
    //     //     const dayEvents = calendarEvents.filter(event => {  
    //     //         console.log(event.date, dateString, "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
    //     //         return event.date === dateString
    //     //     });

    //     //     days.push({
    //     //         date: currentDate,
    //     //         events: dayEvents,
    //     //         isCurrentMonth: currentDate.getMonth() === today.getMonth(),
    //     //         isToday: currentDate.toDateString() === today.toDateString()
    //     //     });
    //     // }

    //     // const days = [];
    //     // const today = new Date();

    //     // // Adjust current day to make Monday = 0, Sunday = 6
    //     // const currentDay = today.getDay(); // 0 (Sun) to 6 (Sat)
    //     // const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    //     // // Get the Monday of the current week
    //     // const monday = new Date(today);
    //     // monday.setDate(today.getDate() + diffToMonday + currentWeekOffset * 7);

    //     // for (let i = 0; i < 7; i++) {
    //     //     const currentDate = new Date(monday);
    //     //     currentDate.setDate(monday.getDate() + i); // Monday + i days

    //     //     const dateString = currentDate.toISOString().split("T")[0]; // "YYYY-MM-DD"

    //     //      const dayEvents = calendarEvents.filter(event => {  
    //     //         console.log(event.date, dateString, "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
    //     //         return event.date === dateString
    //     //     });

    //     //     days.push({
    //     //         date: currentDate,
    //     //         dateString,
    //     //         events: dayEvents,
    //     //         isToday: currentDate.toDateString() === today.toDateString(),
    //     //         isCurrentMonth: currentDate.getMonth() === today.getMonth(),
    //     //     });
    //     // }

    //     const days = [];
    //     const today = new Date();

    //     // Fix to always get the Monday of the current week
    //     const currentDay = today.getDay(); // 0 = Sun ... 6 = Sat
    //     const diffToMonday = (currentDay + 6) % 7;

    //     const monday = new Date(today);
    //     monday.setDate(today.getDate() - diffToMonday + currentWeekOffset * 7);

    //     for (let i = 0; i < 7; i++) {
    //         const currentDate = new Date(monday);
    //         currentDate.setDate(monday.getDate() + i);

    //         const dateString = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD

    //         const dayEvents = calendarEvents.filter(event => {
    //             // console.log(event.date, dateString, "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    //             return event.date === dateString;
    //         });

    //         days.push({
    //             date: currentDate,
    //             dateString,
    //             events: dayEvents,
    //             isToday: currentDate.toDateString() === today.toDateString(),
    //             isCurrentMonth: currentDate.getMonth() === today.getMonth(),
    //         });
    //     }


    //     return days;
    // };

    //     const generateCalendarDays = (currentWeekOffset, calendarEvents) => {
    //     const days = [];
    //     const today = new Date();

    //     const currentDay = today.getDay(); // 0 = Sun ... 6 = Sat
    //     const diffToMonday = (currentDay + 6) % 7;

    //     const monday = new Date(today);
    //     monday.setDate(today.getDate() - diffToMonday + currentWeekOffset * 7);

    //     for (let i = 0; i < 7; i++) {
    //         const currentDate = new Date(monday);
    //         currentDate.setDate(monday.getDate() + i);

    //         const dateString = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD

    //         const dayEvents = calendarEvents.filter(event =>
    //             event.date === dateString
    //         );

    //         days.push({
    //             date: currentDate,
    //             dateString,
    //             events: dayEvents,
    //             isToday: currentDate.toDateString() === today.toDateString(),
    //             isCurrentMonth: currentDate.getMonth() === today.getMonth(),
    //         });
    //     }

    //     return days;
    // };

    const generateCalendarDays = (currentWeekOffset, calendarEvents) => {
        const days = [];
        const today = new Date();

        // Calculate Monday of the current week
        const currentDay = today.getDay(); // 0 = Sunday ... 6 = Saturday
        const diffToMonday = (currentDay + 6) % 7;

        const monday = new Date(today);
        monday.setDate(today.getDate() - diffToMonday + currentWeekOffset * 7);

        // Clone for endDate (Sunday)
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(monday);
            currentDate.setDate(monday.getDate() + i);

            const dateString = currentDate.toISOString().split("T")[0];

            const dayEvents = calendarEvents.filter(event =>
                event.date === dateString
            );

            days.push({
                date: currentDate,
                dateString,
                events: dayEvents,
                isToday: currentDate.toDateString() === today.toDateString(),
                isCurrentMonth: currentDate.getMonth() === today.getMonth(),
            });
        }

        // Return the week days along with start and end dates
        // return {
        //     days,
        //     startDate: monday.toISOString().split("T")[0],
        //     endDate: sunday.toISOString().split("T")[0],
        // };

        return days;
    };

    const getWeekDateRange = (currentWeekOffset) => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday ... 6 = Saturday
        const diffToMonday = (currentDay + 6) % 7;

        const monday = new Date(today);
        monday.setDate(today.getDate() - diffToMonday + currentWeekOffset * 7);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        return {
            startDate: monday.toISOString().split("T")[0],
            endDate: sunday.toISOString().split("T")[0]
        };
    };

    const [showModal, setShowModal] = useState(false);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [balagruhas, setBalagruhas] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [calendarDays, setCalendarDays] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [selectDate, setSelectDate] = useState();
    const [singleSchedule, setSingleSchedule] = useState();
    const [scheduleViewModal, setScheduleViewModal] = useState(false);
    const [assignToDropdown, setAssignToDropdown] = useState(false);
    const [balagruhaDropdown, setBalagruhaDropdown] = useState(false);
    const [editScheduleInput, setEditScheduleInput] = useState();
    const [count, setCount] = useState(1);
    const [formData, setFormData] = useState({
        balagruhaIds: [],
        assignedTo: [],
        schedules: []
    });

    const [currentSchedule, setCurrentSchedule] = useState([
        {
            startTime: '',
            endTime: '',
            date: '',
            title: '',
            description: ''
        }
    ]);

    useEffect(() => {
        if (users) {
            const filteredUser = users.filter(user => user.role !== 'student' && user.role !== 'admin')
            setUsersList(filteredUser)
        }
    }, [users]);

    useEffect(() => {
        const { startDate, endDate } = getWeekDateRange(currentWeekOffset);
        fetchSchedules(selectedBalagruhaOfCoach, startDate, endDate);
    }, [currentWeekOffset, scheduleViewModal]);

    useEffect(() => {
        const days = generateCalendarDays(currentWeekOffset, calendarEvents);
        setCalendarDays(days);
    }, [currentWeekOffset, calendarEvents]);

    // const calendarDays = generateCalendarDays();

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

    const fetchBalagruhaByCoach = async (id) => {
        const response = await getBalagruhaListByAssignedID(id);
        if (response.success) {
            // const role = localStorage.getItem('role');
            // if(role === 'admin') {
            setBalagruhas(response.data.balagruhas);
            // } else {
            //   const balagruhaIdsFromStorage = localStorage.getItem('balagruhaIds')?.split(',');

            //   const filteredBalagruhas = response.data.balagruhas.filter(balagruha =>
            //     balagruhaIdsFromStorage.includes(balagruha._id)
            //   );
            //   console.log("User Balagruha Data: ", filteredBalagruhas);
            //   setBalagruhas(filteredBalagruhas);
            // }
        } else {
            showToast("Error fetching balagruha", "error");
        }

    }

    const handleNewDetailForm = (e) => {
        e.preventDefault();
        setCurrentSchedule(prev => (
            [
                ...prev,
                {
                    startTime: '',
                    endTime: '',
                    date: '',
                    title: '',
                    description: ''
                }
            ]
        ))
    }

    const handleRemoveDetailForm = (index) => {
        setCurrentSchedule(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalSchedules = currentSchedule.map((sch) => {
            if (sch.date && sch.startTime && sch.endTime) {
                const start = new Date(`${sch.date}T${sch.startTime}:00`);
                const end = new Date(`${sch.date}T${sch.endTime}:00`);

                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    // throw new Error("Invalid date or time format.");
                    showToast('Invalid date or time format.', 'error')
                }

                if (start >= end) {
                    // throw new Error("Start time must be before end time.");
                    showToast('Start time must be before end time.', 'er')
                }

                return {
                    ...sch,
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                };
            } else {
                // throw new Error("Missing date, start time, or end time.");
                showToast('Missing date, start time, or end time.', 'error')
            }
        });


        setFormData(prev => ({
            ...prev,
            schedules: finalSchedules
        }))

        try {
            // const formDataToSend = new FormData();
            // formDataToSend.append('balagruhaIds', formData.balagruhaIds);
            // formDataToSend.append('assignedTo', formData.assignedTo);
            // formDataToSend.append('schedules', finalSchedules);

            const dataToBeSend = {
                assignedTo: formData.assignedTo,
                balagruhaIds: formData.balagruhaIds,
                schedules: finalSchedules
            }

            const response = await createSchedule(dataToBeSend);
            if (response.success) {
                showToast('Schedule created Successfully', 'success')
                setFormData({
                    balagruhaIds: [],
                    assignedTo: [],
                    schedules: []
                })
                setCurrentSchedule([
                    {
                        startTime: '',
                        endTime: '',
                        date: '',
                        title: '',
                        description: ''
                    }
                ])
                setInputValue('');
                const { startDate, endDate } = getWeekDateRange(currentWeekOffset);
                fetchSchedules(selectedBalagruhaOfCoach, startDate, endDate);
            }
            setShowModal(false);
        } catch (error) {
            showToast(`${error.response.data.message} Task: ${error.response.data.overlappingSchedules[0].overlappingSchedule.title}, Slot time: ${new Date(error.response.data.overlappingSchedules[0].overlappingSchedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(error.response.data.overlappingSchedules[0].overlappingSchedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 'error')
        }
    }

    const hours = Array.from({ length: 12 }, (_, i) => {
        const hour = i + 8; // 8 AM to 8 PM
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    const handleSelect = (user) => {
        setInputValue(user.name);
        setFormData(prev => ({ ...prev, assignedTo: [user._id] }));
        setAssignToDropdown(false);
        fetchBalagruhaByCoach(user._id)
    };

    const handleScheduleViewModal = (schedule) => {
        console.log('click worked', schedule);
        setScheduleViewModal(true);
        setSingleSchedule(schedule);
    }

    const handleEditInput = (inputName) => {
        setEditScheduleInput(inputName)
    }

    function getLocalTimeHHMM(dateString) {
        const date = new Date(dateString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
        }

    const handleEditOnchange = (field, value) => {
        setSingleSchedule(prev => ({ ... prev, [field] : value }))
    }

    const handleUpdate = async() => {

       try {
         const dataToSend = {
            balagruhaId: singleSchedule.balagruhaId,
            assignedTo: singleSchedule.assignedTo,
            startTime: singleSchedule.startTime,
            endTime: singleSchedule.endTime,
            date: singleSchedule.date,
            title: singleSchedule.title,
            description: singleSchedule.description,
        }

        await updateSchedule(dataToSend, singleSchedule._id);
        showToast('Schedule updated Successfully', 'success');
        setEditScheduleInput();

       } catch (error) {
        showToast(error.response.data.message || "Something went wrong, Failed to update schedule!", 'error')
       }

    }

    const handleEditOnchangeForDate = (field, timeValue) => {
        const currentDateTime = new Date(singleSchedule[field]); // full original datetime
        const [hours, minutes] = timeValue.split(':').map(Number);

        // Update only the time part
        currentDateTime.setHours(hours);
        currentDateTime.setMinutes(minutes);
        currentDateTime.setSeconds(0);
        currentDateTime.setMilliseconds(0);

        // Save the updated datetime back as an ISO string
        setSingleSchedule(prev => ({ ...prev, [field]: currentDateTime.toISOString() }));
    };

    const handleCloseViewSchedule = () => {
        setScheduleViewModal(false);
        setEditScheduleInput();
    }

    const handleDelete = async(id) => {
        try {
            await deleteSchedule(id);
            setScheduleViewModal(false);
            showToast("Schedule deleted successfully", 'success'); 
        } catch (error) {
            showToast("Something went wrong while deleting schedule", 'error')
        }
    }

    return (
        <>
            <button className='add-task-button-schedule-btn' onClick={() => setShowModal(true)}>Add Schedule</button>
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

                {/* <div className='calender-container'>
                   <div>
                    <div className="calendar-day-header">
                        <h3>Time</h3>
                    </div>
                    <div className="">
                        {Array.from({ length: 12 }, (_, i) => {
                            const hour = i + 7; // Starting from 7 AM
                            return (
                                <p style={{marginTop: "100px"}} key={hour}>
                                    {`${hour.toString().padStart(2, '0')}:00`}
                                </p>
                            );
                        })}
                    </div>
                </div>

                <div className="calendar-grid">
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
                </div> */

                    <div className="calendar-container">
                        {/* Time Column */}
                        <div className="time-column">
                            <div className="calendar-day-header" style={{ marginBottom: "50px" }}>
                                <h3>Time</h3>
                            </div>
                            <div className="time-slots">
                                {Array.from({ length: 12 }, (_, i) => {
                                    const hour = i + 7;
                                    return (
                                        <div className="time-slot" key={hour}>
                                            {`${hour.toString().padStart(2, '0')}:00`}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="calendar-grid">
                            {/* Day headers */}
                            <div className="calendar-row calendar-header-row">
                                {calendarDays.map((day, index) => (
                                    <div
                                        key={`header-${index}`}
                                        onClick={() => setSelectDate(day.date)}
                                        className={`calendar-day-header ${day.date?.toDateString() === selectDate?.toDateString() ? 'today' : ''}`}
                                    >
                                        {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                                        <div className="day-date">
                                            {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Day columns */}
                            <div className="calendar-row calendar-body-row">
                                {calendarDays.map((day, index) => (
                                    <div key={`cell-${index}`} className="calendar-day-cell">
                                        {Array.from({ length: 12 }, (_, i) => {
                                            // const slotEvents = day.events.filter(ev => {
                                            //     // console.log(ev, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
                                            //     const eventHour = new Date(ev.schedules[0].startTime).getHours();
                                            //     return eventHour === i + 7;
                                            // });

                                            // const slotEvents = day.events.filter(ev => {
                                            //     return ev.schedules.some(schedule => {
                                            //         const eventHour = new Date(schedule.startTime).getHours();
                                            //         return eventHour === i + 7;
                                            //     });
                                            // });

                                            const slotEvents = day.events.flatMap(ev =>
                                                ev.schedules.filter(schedule => {
                                                    const eventHour = new Date(schedule.startTime).getHours();
                                                    return eventHour === i + 7;
                                                })
                                            );
                                            return (
                                                <div key={i} className="calendar-time-cell">
                                                    {/* {slotEvents.length === 0 ? (
                                                                <div className="no-events">No events</div>
                                                            ) : (
                                                                // slotEvents.map(event => {
                                                                //     console.log("NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN", event)
                                                                //     return (
                                                                //         (
                                                                //             <div
                                                                //                 key={event.id}
                                                                //                 className="calendar-event"
                                                                //                 style={{ backgroundColor: getEventColor(event.type) }}
                                                                //                 onClick={() => onEventClick(event)}
                                                                //             >
                                                                //                 <div className="event-title">{event.title}</div>
                                                                //                 <div className="event-time">{event.time}</div>
                                                                //                 <div
                                                                //                     className="event-status-indicator"
                                                                //                     style={{
                                                                //                         backgroundColor:
                                                                //                             event.status === "Confirmed" ? "#4caf50" :
                                                                //                                 event.status === "Pending" ? "#ff9800" :
                                                                //                                     event.status === "Completed" ? "#8a7bff" : "#f44336"
                                                                //                     }}
                                                                //                 ></div>
                                                                //             </div>
                                                                //         )
                                                                //     )
                                                                // })
                                                                slotEvents.map(event => {
                                                                    return event.schedules.map(schedule => {
                                                                        const eventHour = new Date(schedule.startTime).getHours();
                                                                        console.log(event, "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS")
                                                                        return (
                                                                            <div
                                                                                key={schedule._id}  // Use the schedule's _id as the key
                                                                                className="calendar-event"
                                                                                style={{ backgroundColor: getEventColor(event.type) }}
                                                                                onClick={() => onEventClick(event)}
                                                                            >
                                                                                <div className="event-title">{schedule.title}</div>
                                                                                <div className="event-time">{schedule.timeSlot}</div>
                                                                                <div
                                                                                    className="event-status-indicator"
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            event.status === "Confirmed" ? "#4caf50" :
                                                                                                event.status === "Pending" ? "#ff9800" :
                                                                                                    event.status === "Completed" ? "#8a7bff" : "#f44336"
                                                                                    }}
                                                                                ></div>
                                                                            </div>
                                                                        );
                                                                    });
                                                                })
                                                            )} */}

                                                    {slotEvents.length === 0 ? (
                                                        <div className="no-events">No events</div>
                                                    ) : (
                                                        slotEvents.map(schedule => {
                                                            return (
                                                                (
                                                                    <div
                                                                        key={schedule._id}
                                                                        className="calendar-event"
                                                                        style={{ backgroundColor: getEventColor(schedule.type) }}
                                                                        onClick={() => handleScheduleViewModal(schedule)} // You might pass the full schedule
                                                                    >
                                                                        <div className="event-title">{schedule.title}</div>
                                                                        <div className="event-coach">Coach: {schedule?.assignedToUser?.name}</div>
                                                                        <div className="event-time">
                                                                            {new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                                            {new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </div>
                                                                        <div
                                                                            className="event-status-indicator"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    schedule.status === "Confirmed" ? "#4caf50" :
                                                                                        schedule.status === "Pending" ? "#ff9800" :
                                                                                            schedule.status === "Completed" ? "#8a7bff" : "#f44336"
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                )
                                                            )
                                                        })
                                                    )}

                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                }

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                {/* <h3>{modalMode === 'create' ? 'Add New Balagruha' : 'Edit Balagruha'}</h3> */}
                                <h3>Add new schedule</h3>
                                <button
                                    className="close-button"
                                    onClick={() => setShowModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <form
                                onSubmit={handleSubmit}
                            >
                                <div className="form-group">
                                    <label htmlFor='assignedTo'>Assigned To</label>

                                    {/* <input
                                        placeholder='Select the user'
                                        type="text"
                                        onClick={() => setAssignToDropdown(prev => !prev)}
                                        // value={formData?.assignedTo[0]}
                                        // readOnly
                                        value={usersList
                                            .filter(user => formData.assignedTo.includes(user._id))
                                            .map(user => user.name)
                                            .join(', ')
                                        }
                                    /> */}

                                    <input
                                        type="text"
                                        placeholder="Select or type user"
                                        value={inputValue}
                                        onChange={(e) => {
                                            setInputValue(e.target.value);
                                            setAssignToDropdown(true);
                                        }}
                                        onClick={() => setAssignToDropdown(prev => !prev)}
                                    />
                                    {/* {assignToDropdown && (
                                        <div style={{ position: "relative" }}>
                                            <div style={{ height: "200px", width: "100%", backgroundColor: "#fff", overflowY: "auto", position: "absolute" }}>
                                                {usersList.map((user) => (
                                                    <label key={user._id} style={{ display: "flex", gap: "20px", cursor: "pointer" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.assignedTo.includes(user._id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        assignedTo: [...prev.assignedTo, user._id]
                                                                    }));
                                                                } else {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        assignedTo: prev.assignedTo.filter(id => id !== user._id)
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                        <span>{user.name}</span>
                                                    </label>
                                                ))}

                                            </div>
                                        </div>
                                    )} */}

                                    {assignToDropdown && (
                                        <div style={{ position: "relative" }}>
                                            <div style={{ height: "200px", width: "100%", backgroundColor: "#fff", overflowY: "auto", position: "absolute" }}>
                                                {usersList
                                                    .filter(user => user?.name?.toLowerCase().includes(inputValue?.toLowerCase()))
                                                    .map(user => (
                                                        <label className='label-assigned' key={user._id} style={{ display: "flex", gap: "20px", cursor: "pointer", padding: "5px 20px" }} onClick={() => handleSelect(user)}>
                                                            <span>{user.name}</span>
                                                        </label>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="balagruha">Balagruha</label>
                                    {/* <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={formErrors.name ? 'error' : ''}
                                    />
                                    {formErrors.name && <div className="error-message">{formErrors.name}</div>} */}

                                    <input
                                        placeholder='Select the Balagruha'
                                        type="text"
                                        onClick={() => setBalagruhaDropdown(prev => !prev)}
                                        // value={formData?.assignedTo[0]}
                                        // readOnly
                                        value={balagruhas
                                            .filter(bal => formData.balagruhaIds.includes(bal._id))
                                            .map(bal => bal.name)
                                            .join(', ')
                                        }
                                    />

                                    {/* <select
                                        // value={purchaseForm.balagruhaId}
                                        onChange={(e) => {
                                            setSelectedBalagruha(e.target.value)
                                            setFormData(prev => ({ ...prev, balagruhaId: e.target.value }))
                                        }}
                                        required
                                    >
                                        <option value="">Select Balagruha</option>
                                        {balagruhas.map((bal) => (
                                            <option key={bal.id} value={bal._id}>
                                                {bal.name}
                                            </option>
                                        ))}
                                    </select> */}

                                    {balagruhaDropdown && (
                                        <div style={{ position: "relative" }}>
                                            {balagruhas.length === 0 ? (
                                                <div style={{ height: "20px", width: "100%", backgroundColor: "#fff", overflowY: "auto", position: "absolute" }}>
                                                    <p>No balagruha here.</p>
                                                </div>
                                            ) : (
                                                <div style={{ height: "200px", width: "100%", backgroundColor: "#fff", overflowY: "auto", position: "absolute" }}>
                                                    {balagruhas.map((bal) => (
                                                        <label key={bal._id} style={{ display: "flex", gap: "20px", cursor: "pointer" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.balagruhaIds.includes(bal._id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            balagruhaIds: [...prev.balagruhaIds, bal._id]
                                                                        }));
                                                                    } else {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            balagruhaIds: prev.balagruhaIds.filter(id => id !== bal._id)
                                                                        }));
                                                                    }
                                                                }}
                                                            />
                                                            <span>{bal.name}</span>
                                                        </label>
                                                    ))}

                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className='end-btn-div'>
                                    <button className='add-task-button-schedule-btn-new' onClick={handleNewDetailForm}>Create New Detail Form</button>
                                </div>

                                {currentSchedule?.map((item, index) => (
                                    <div key={index} style={{ backgroundColor: "#f7f7f7", padding: "20px", marginTop: "20px" }}>
                                        <div className='close-btn-newdetails'>
                                            <button
                                                className="close-button"
                                                onClick={() => handleRemoveDetailForm(index)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="startTime">Start Time</label>
                                            <input
                                                type="time"
                                                id="startTime"
                                                name="startTime"
                                                value={item.startTime}
                                                onChange={(e) => {
                                                    const updated = [...currentSchedule];
                                                    updated[index].startTime = e.target.value;
                                                    setCurrentSchedule(updated);
                                                }}
                                            // value={formData.deadline}
                                            // onChange={handleInputChange}
                                            // className={formErrors.deadline ? 'error' : ''}
                                            // min={new Date().toISOString().split('T')[0]}
                                            />
                                            {/* {formErrors.deadline && <div className="error-message">{formErrors.deadline}</div>} */}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="endTime">End Time</label>
                                            <input
                                                type="time"
                                                id="endTime"
                                                name="endTime"
                                                value={item.endTime}
                                                onChange={(e) => {
                                                    const updated = [...currentSchedule];
                                                    updated[index].endTime = e.target.value;
                                                    setCurrentSchedule(updated);
                                                }}
                                            // value={formData.deadline}
                                            // onChange={handleInputChange}
                                            // className={formErrors.deadline ? 'error' : ''}
                                            // min={new Date().toISOString().split('T')[0]}
                                            />
                                            {/* {formErrors.deadline && <div className="error-message">{formErrors.deadline}</div>} */}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="date">Date</label>
                                            <input
                                                type="date"
                                                id="date"
                                                name="date"
                                                value={item.date}
                                                onChange={(e) => {
                                                    const updated = [...currentSchedule];
                                                    updated[index].date = e.target.value;
                                                    setCurrentSchedule(updated);
                                                }}
                                            // value={formData.deadline}
                                            // onChange={handleInputChange}
                                            // className={formErrors.deadline ? 'error' : ''}
                                            // min={new Date().toISOString().split('T')[0]}
                                            />
                                            {/* {formErrors.deadline && <div className="error-message">{formErrors.deadline}</div>} */}
                                        </div>


                                        <div className="form-group">
                                            <label htmlFor="title">Title</label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                placeholder='Enter your title'
                                                value={item.title}
                                                onChange={(e) => {
                                                    const updated = [...currentSchedule];
                                                    updated[index].title = e.target.value;
                                                    setCurrentSchedule(updated);
                                                }}
                                            // value={formData.deadline}
                                            // onChange={handleInputChange}
                                            // className={formErrors.deadline ? 'error' : ''}
                                            // min={new Date().toISOString().split('T')[0]}
                                            />
                                            {/* {formErrors.deadline && <div className="error-message">{formErrors.deadline}</div>} */}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="description">Description</label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={item.description}
                                                onChange={(e) => {
                                                    const updated = [...currentSchedule];
                                                    updated[index].description = e.target.value;
                                                    setCurrentSchedule(updated);
                                                }}
                                                // value={formData.description}
                                                // onChange={handleInputChange}
                                                // className={formErrors.description ? 'error' : ''}
                                                placeholder="Enter task description"
                                                rows="4"
                                            ></textarea>
                                            {/* {formErrors.description && <div className="error-message">{formErrors.description}</div>} */}
                                        </div>
                                    </div>
                                ))}

                                <div className="modal-actions">
                                    <button type="submit" className="submit-button">
                                        {/* {modalMode === 'create' ? 'Add Balagruha' : 'Save Changes'} */}
                                        Submit
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {scheduleViewModal && (
                    <div className="modal-overlay">
                        <div className="modal-content-schedule">
                            <div className="modal-header">
                                {/* <h3>{modalMode === 'create' ? 'Add New Balagruha' : 'Edit Balagruha'}</h3> */}
                                <h3>View schedule</h3>
                                <button
                                    className="close-button"
                                    onClick={handleCloseViewSchedule}
                                >
                                    ×
                                </button>
                            </div>
                            <div>
                                <div className='master-div-schedule'>
                                    <div className='view-container'>
                                        <label htmlFor="" className='schedule-label'>Title: </label>
                                        {editScheduleInput === 'title' ? (
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <input className='schedule-edit-input' value={singleSchedule?.title} onChange={(e) => handleEditOnchange('title', e.target.value)} />
                                                <button className='schedule-edit-btn' onClick={handleUpdate}>✅ </button>
                                                <button className='schedule-edit-btn' onClick={() => setEditScheduleInput()}>❌ </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <p className='schedule-p'>{singleSchedule?.title}</p>
                                                <p className='edit-schedule' onClick={() => handleEditInput('title')}>✏️</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className='view-container'>
                                        <label htmlFor="" className='schedule-label'>Description: </label>
                                        {editScheduleInput === 'description' ? (
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <input className='schedule-edit-input' value={singleSchedule?.description} onChange={(e) => handleEditOnchange('description', e.target.value)}/>
                                                <button className='schedule-edit-btn' onClick={handleUpdate}>✅ </button>
                                                <button className='schedule-edit-btn' onClick={() => setEditScheduleInput()}>❌ </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <p className='schedule-p'>{singleSchedule?.description}</p>
                                                <p className='edit-schedule' onClick={() => handleEditInput('description')}>✏️</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className='view-container'>
                                        <label htmlFor="" className='schedule-label'>Date: </label>
                                        {/* <p className='schedule-p'>{new Date(singleSchedule?.date).toLocaleDateString()}</p> */}
                                        {editScheduleInput === 'date' ? (
                                            <div>
                                                <input
                                                type='date'
                                                className='schedule-edit-input'
                                                value={new Date(singleSchedule?.date).toISOString().split('T')[0]}
                                                onChange={(e) => handleEditOnchange('date', e.target.value)}
                                            />
                                              <button className='schedule-edit-btn' onClick={handleUpdate}>✅ </button>
                                                <button className='schedule-edit-btn' onClick={() => setEditScheduleInput()}>❌ </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <p className='schedule-p'>{new Date(singleSchedule?.date).toLocaleDateString()}</p>
                                                <p className='edit-schedule' onClick={() => handleEditInput('date')}>✏️</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className='view-container'>
                                        <label htmlFor="" className='schedule-label'>Start Time: </label>
                                        {/* <p className='schedule-p'>{new Date(singleSchedule?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p> */}
                                        {editScheduleInput === 'startTime' ? (
                                            <div>
                                               <input
                                                    type='time'
                                                    className='schedule-edit-input'
                                                    value={singleSchedule?.startTime ? getLocalTimeHHMM(singleSchedule.startTime) : ''}
                                                    onChange={(e) => handleEditOnchangeForDate('startTime', e.target.value)}
                                                    />
                                              <button className='schedule-edit-btn' onClick={handleUpdate}>✅ </button>
                                                <button className='schedule-edit-btn' onClick={() => setEditScheduleInput()}>❌ </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <p className='schedule-p'>{new Date(singleSchedule?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <p className='edit-schedule' onClick={() => handleEditInput('startTime')}>✏️</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className='view-container'>
                                        <label htmlFor="" className='schedule-label'>End Time: </label>
                                        {/* <p className='schedule-p'>{new Date(singleSchedule?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p> */}
                                         {editScheduleInput === 'endTime' ? (
                                            <div>
                                               <input
                                                    type='time'
                                                    className='schedule-edit-input'
                                                    value={singleSchedule?.endTime ? getLocalTimeHHMM(singleSchedule.endTime) : ''}
                                                    onChange={(e) => handleEditOnchangeForDate('endTime', e.target.value)}
                                                    />
                                              <button className='schedule-edit-btn' onClick={handleUpdate}>✅ </button>
                                                <button className='schedule-edit-btn' onClick={() => setEditScheduleInput()}>❌ </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <p className='schedule-p'>{new Date(singleSchedule?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <p className='edit-schedule' onClick={() => handleEditInput('endTime')}>✏️</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className='view-container'>
                                        <label htmlFor="" className='schedule-label'>Balagruha: </label>
                                        <p className='schedule-p'>{singleSchedule?.balagruha?.name}</p>
                                    </div>
                                    <div className='view-container'>
                                        <label htmlFor="" className='schedule-label'>Assigned To: </label>
                                        <p className='schedule-p'>{singleSchedule?.assignedToUser?.name}</p>
                                    </div>
                                    <div className='view-container'>
                                        <label htmlFor="" className='schedule-label'>Created By: </label>
                                        <p className='schedule-p'>{singleSchedule?.createdByUser?.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(singleSchedule._id)} className='delete-btn-schedule'>🗑️ Delete Schedule</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};

export default WeeklyCalendar;