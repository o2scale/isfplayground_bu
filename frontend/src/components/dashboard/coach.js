// Coach Dashboard
import React, { useState, useEffect } from 'react';
import './coach-styles.css';
import WeeklyCalendar from './WeeklyCalendar';
import { getBalagruha, getTasks, updateTask, fetchUsers, getTaskBytaskId, getBalagruhaById } from '../../api'
import { TaskDetailsModal } from '../TaskManagement/taskmanagement';

function CoachDashboard() {
    // State variables remain the same
    const [selectedCoach, setSelectedCoach] = useState(1);
    const [coachMenuSelected, setCoachMenuSelected] = useState(1);
    const [showChatWindow, setShowChatWindow] = useState(null);
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventHoverPosition, setEventHoverPosition] = useState({ top: 0, left: 0 });
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [users, setUsers] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [balagruhas, setBalagruhas] = useState([]);
    const [machines, setMachines] = useState([]);
    const [selectedBalagruha, setSelectedBalagruha] = useState();
    const [chatMessages, setChatMessages] = useState({
        child: [
            { sender: "child", message: "Hello Coach! How are you today?", time: "10:30 AM" },
            { sender: "me", message: "I'm doing great! How was your English lesson?", time: "10:32 AM" },
            { sender: "child", message: "It was fun! I learned new words.", time: "10:33 AM" },
            { sender: "child", message: "When is our next activity?", time: "10:34 AM" },
            { sender: "me", message: "We have a group activity tomorrow at 3 PM.", time: "10:35 AM" },
            { sender: "me", message: "Don't forget to bring your notebook.", time: "10:36 AM" },
            { sender: "child", message: "I won't forget! Thank you.", time: "10:40 AM" },
        ],
        admin: [
            { sender: "admin", message: "Hi Coach! How are the children doing?", time: "9:15 AM" },
            { sender: "me", message: "They're doing well. We completed the English module.", time: "9:20 AM" },
            { sender: "admin", message: "Great! Any issues to report?", time: "9:22 AM" },
            { sender: "me", message: "No major issues. A few children need extra help.", time: "9:23 AM" },
            { sender: "admin", message: "Let's discuss that in our meeting tomorrow.", time: "9:25 AM" },
            { sender: "admin", message: "Also, please submit your weekly report by Friday.", time: "9:30 AM" },
            { sender: "me", message: "Will do. Thanks for the reminder!", time: "9:35 AM" },
        ]
    });

    // API function implementations
    const getBalagruhaList = async () => {
        try {
            const id = localStorage.getItem('userId')
            const response = await getBalagruhaById(id);
            console.log('Balagruha details:', response?.data?.balagruhas);
            setBalagruhas(response?.data?.balagruhas || []);
        } catch (error) {
            console.error('Error fetching balagruha list:', error);
        }
    };

    const getTasksList = async () => {
        try {
            // If a balagruha is selected, use that ID, otherwise use a default
            const data = {
                balagruhaId: selectedBalagruha || "67b63186d2486ca7b43fe418"
            };
            const response = await getTasks(JSON.stringify(data));
            console.log('Tasks details:', response?.data?.tasks);

            // Convert tasks to calendar events format
            const formattedTasks = (response?.data?.tasks || []).map(task => ({
                id: task._id,
                title: task.title,
                location: task.location || "Not specified",
                date: task.deadline ? task.deadline.split('T')[0] : new Date().toISOString().split('T')[0],
                time: task.startTime || "All day",
                type: (task.priority || "medium").toLowerCase(),
                description: task.description,
                attendees: [
                    users.find(u => u._id === task.assignedUser)?.name || "Unassigned",
                    users.find(u => u._id === task.createdBy)?.name || "Unknown"
                ],
                status: task.status === "completed" ? "Completed" :
                    task.status === "in progress" ? "In Progress" : "Pending",
                taskData: task
            }));

            setTasks(formattedTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const getUsersList = async () => {
        try {
            const response = await fetchUsers();
            console.log('Users details:', response);

            // Set all users
            setUsers(response || []);

            // Filter coaches
            const coachUsers = (response || []).filter(user => user.role === "coach");
            setCoaches(coachUsers);

            // Filter students
            const studentUsers = (response || []).filter(user => user.role === "student");
            setStudents(studentUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const getTaskDetailsByTaskId = async (id) => {
        try {
            const response = await getTaskBytaskId(id)
            setSelectedTask(response.data?.task)
        } catch (err) {
            console.error('Error updating task status:', err);

        }
    }

    // Handle task status change
    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await updateTask(taskId, JSON.stringify({ status: newStatus }));
            // Refresh tasks after update
            getTasksList();
            getTaskDetailsByTaskId(taskId)
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    // Handle task update
    const handleUpdateTask = async (taskId, updateData) => {
        try {
            await updateTask(taskId, JSON.stringify(updateData));
            // Refresh tasks after update
            getTasksList();
            getTaskDetailsByTaskId(taskId)
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    // Load data when component mounts
    useEffect(() => {
        getBalagruhaList();
        getUsersList();
    }, []);

    // Load tasks when selected balagruha changes
    useEffect(() => {
        if (selectedBalagruha) {
            getTasksList();
        }
    }, [selectedBalagruha, users]); // Also refresh when users are loaded for proper name display

    // Event handlers
    const handleEventClick = (event) => {
        setSelectedTask(event.taskData);
        setShowTaskModal(true);
    };

    const handleChatClick = (contactType) => {
        setShowChatWindow(contactType);
    };

    const handleSendMessage = (chatType, message) => {
        if (!message.trim()) return;

        const newMessage = {
            sender: "me",
            message: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatMessages(prev => ({
            ...prev,
            [chatType]: [...prev[chatType], newMessage]
        }));
    };

    // Coach menus
    const coachMenus = [
        { id: 1, name: "Daily Schedule", count: tasks.length },
        { id: 2, name: "Task Tracker" },
        { id: 3, name: "Medical" },
        { id: 4, name: "Syllabus Tracker" },
        { id: 5, name: "Slow Learners" },
        { id: 6, name: "Repairs" },
        { id: 7, name: "Purchase" },
        { id: 8, name: "ISF Shop" },
        { id: 9, name: "Suggestion" },
        { id: 10, name: "Activities" },
        { id: 11, name: "Events" },
    ];

    // Top menus
    const topMenus = [
        { id: 1, name: "Task Tracker" },
        { id: 2, name: "Child Chats" },
        { id: 3, name: "Coach Chats" },
        { id: 4, name: "Cont Deve" },
        { id: 5, name: "ISF Shop" },
        { id: 6, name: "Slow learner" },
        { id: 7, name: "Comp Usage" },
        { id: 8, name: "Med Camp" },
        // { id: 9, name: "Reports" },
        { id: 10, name: "Settings" },
    ];

    // Generate dummy data for menu items
    const getDummyData = (menuName) => {
        const data = [];
        for (let i = 1; i <= 10; i++) {
            data.push({
                id: i,
                name: `${menuName} Item ${i}`,
                status: Math.floor(Math.random() * 100),
                date: new Date().toLocaleDateString()
            });
        }
        return data;
    };

    // Chat window component
    const ChatWindow = ({ type, onClose }) => {
        const [newMessage, setNewMessage] = useState("");
        const messagesEndRef = React.useRef(null);

        const scrollToBottom = () => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        };

        React.useEffect(() => {
            const timeoutId = setTimeout(() => {
                scrollToBottom();
            }, 100);
            return () => clearTimeout(timeoutId);
        }, [chatMessages[type].length]);

        return (
            <div className="chat-window">
                <div className="chat-header">
                    <div className="chat-header-user">
                        <div className="chat-avatar">
                            {type === "child" ? (
                                <div className="avatar-circle">C</div>
                            ) : (
                                <div className="avatar-circle">A</div>
                            )}
                        </div>
                        <span>{type === "child" ? "Child Chat" : "Admin Chat"}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="chat-close-btn"
                    >
                        ✖
                    </button>
                </div>

                {/* Chat messages */}
                <div className="chat-messages">
                    {chatMessages[type].map((msg, index) => (
                        <div
                            key={index}
                            className={`chat-message ${msg.sender === "me" ? "my-message" : "their-message"}`}
                        >
                            <div className="message-content">{msg.message}</div>
                            <div className="message-time">{msg.time}</div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat input */}
                <div className="chat-input">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage(type, newMessage);
                                setNewMessage("");
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            handleSendMessage(type, newMessage);
                            setNewMessage("");
                        }}
                        className="send-btn"
                    >
                        ➤
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="coach-dashboard">
            {/* Sticky Chat Buttons */}
            {showTaskModal && selectedTask && (
                <TaskDetailsModal
                    task={selectedTask}
                    onClose={() => { setShowTaskModal(false); }}
                    users={users}
                    onStatusChange={handleStatusChange}
                    onUpdateTask={handleUpdateTask}
                />
            )}
            {/* <div className="sticky-chat-buttons">
                <button
                    className="sticky-chat-button child"
                    onClick={() => handleChatClick("child")}
                    title="Child Chat"
                >
                    C
                    <span className="sticky-chat-badge">7</span>
                </button>
                <button
                    className="sticky-chat-button admin"
                    onClick={() => handleChatClick("admin")}
                    title="Admin Chat"
                >
                    A
                    <span className="sticky-chat-badge">7</span>
                </button>
            </div> */}

            <div className="main-content full-width">
                <div className="full-panel">
                    {/* Balagruha assigned to coach */}
                    <div className="assigned-balagruha">
                        <div className="scroll-container">
                            {balagruhas.map(balagruha => (
                                <div
                                    key={balagruha._id}
                                    className={`balagruha-item ${selectedBalagruha === balagruha._id ? 'selected' : ''}`}
                                    onClick={() => setSelectedBalagruha(balagruha._id)}
                                >
                                    {balagruha.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Coach Menus */}
                    <div className="coach-menus">
                        <div className="menu-grid">
                            {coachMenus.map(menu => (
                                <div style={{ position: "relative" }}>
                                    <div
                                        key={menu.id}
                                        className={`menu-item ${coachMenuSelected === menu.id ? 'selected' : ''}`}
                                        onClick={() => setCoachMenuSelected(menu.id)}
                                    >

                                        {menu.name}
                                    </div>
                                    <div className='menu-bubble'>{menu.count ? menu.count : 0}</div>
                                </div>
                            ))}
                        </div>

                        {/* Display dummy data when coach menu is selected */}
                        {coachMenuSelected && coachMenuSelected !== 1 && (
                            <div className="data-display">
                                <h3>{coachMenus.find(m => m.id === coachMenuSelected)?.name}</h3>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getDummyData(coachMenus.find(m => m.id === coachMenuSelected)?.name).map((item, index) => (
                                            <tr key={item.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                                                <td>{item.name}</td>
                                                <td>
                                                    <div className="progress-bar-container">
                                                        <div
                                                            className="progress-bar"
                                                            style={{
                                                                width: `${item.status}%`,
                                                                backgroundColor: item.status > 70 ? "#4caf50" : item.status > 40 ? "#ff9800" : "#f44336"
                                                            }}
                                                        ></div>
                                                    </div>
                                                </td>
                                                <td>{item.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Weekly Calendar (shown when Daily Schedule is selected) */}
                        {coachMenuSelected === 1 && (
                            <WeeklyCalendar
                                currentWeekOffset={currentWeekOffset}
                                setCurrentWeekOffset={setCurrentWeekOffset}
                                calendarEvents={tasks.length > 0 ? tasks : [
                                    // Fallback dummy data if no tasks are loaded
                                    {
                                        id: 1,
                                        title: "Visit to Sampare",
                                        location: "Shelpimplegaon",
                                        date: "2025-03-20",
                                        time: "09:00-11:00",
                                        type: "visit",
                                        description: "Regular visit to check on children's progress",
                                        attendees: ["Coach 1", "Admin", "Local Volunteer"],
                                        status: "Confirmed",
                                        taskData: {
                                            _id: "1",
                                            title: "Visit to Sampare",
                                            description: "Regular visit to check on children's progress",
                                            status: "pending",
                                            priority: "High",
                                            deadline: "2025-03-20T11:00:00",
                                            createdAt: "2025-03-15T09:00:00",
                                            assignedUser: "1",
                                            createdBy: "2",
                                            comments: [],
                                            attachments: []
                                        }
                                    }
                                ]}
                                users={users}
                                onEventClick={handleEventClick}
                            />
                        )}
                    </div>
                </div>

                {/* Chat windows */}
                {showChatWindow === "child" && (
                    <ChatWindow
                        type="child"
                        onClose={() => setShowChatWindow(null)}
                    />
                )}

                {showChatWindow === "admin" && (
                    <ChatWindow
                        type="admin"
                        onClose={() => setShowChatWindow(null)}
                    />
                )}
            </div>
        </div>
    );
}

export default CoachDashboard;