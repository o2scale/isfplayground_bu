import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { getBalagruha, getTasks, updateTask, fetchUsers, getStudentListforAttendance, getMachines, getTaskBytaskId, getAnyUserBasedonRoleandBalagruha } from "../../api";
import { TaskDetailsModal } from "../TaskManagement/taskmanagement";
import WeeklyCalendar from "./WeeklyCalendar";

function AdminDashboard() {
    // Initialize with pre-selected values
    const [selectedBalagruha, setSelectedBalagruha] = useState();
    const [selectedCoach, setSelectedCoach] = useState(1);
    const [adminMenuSelected, setAdminMenuSelected] = useState(1);
    const [coachMenuSelected, setCoachMenuSelected] = useState(1);
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
    const [balagruhas, setBalagruhas] = useState([]);
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);
    const [balagruhaStudents, setBalagruhaStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);

    // New state variables for task modal
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [users, setUsers] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [machines, setMachines] = useState([]);

    const getBalagruhaList = async () => {
        try {
            const response = await getBalagruha(JSON.stringify());
            console.log('balagruha details', response?.data?.balagruhas);
            setBalagruhas(response?.data?.balagruhas || []);
        } catch (error) {
            console.error('Error fetching balagruha list:', error);
        }
    };

    const getCoachNameBasedonBalagruha = async () => {
        const response = await getAnyUserBasedonRoleandBalagruha("coach", selectedBalagruha);
        setCoaches(response.data?.users || []);
    }

    const getMachinesData = async () => {
        const response = await getMachines();
        console.log('response', response.data?.machines)
        setMachines(response.data.machines)
    }

    const getTasksList = async () => {
        let data = {
            balagruhaId: selectedBalagruha
        }
        try {
            const response = await getTasks(JSON.stringify(data));
            console.log('tasks details', response?.data?.tasks);
            setTasks(response?.data?.tasks || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const getUsersList = async () => {
        try {
            const response = await fetchUsers();
            console.log('users details', response);

            // Set all users
            setUsers(response || []);

            const studentUsers = (response || []).filter(user => user.role === "student");
            setStudents(studentUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const getStudentListBasedonDate = async (id) => {
        try {
            const response = await getStudentListforAttendance(id, new Date());
            setAttendance(response?.data?.studentList || []);

            // Set students for the selected balagruha
            const balagruhaStudentsList = response?.data?.studentList || [];
            setBalagruhaStudents(balagruhaStudentsList);
            setShowStudentDropdown(true);
        } catch (error) {
            console.error('Error fetching student list:', error);
        }
    };

    useEffect(() => {
        getBalagruhaList();
        getTasksList();
        getUsersList();
        getMachinesData();
        getCoachNameBasedonBalagruha();
    }, [selectedBalagruha]);



    // Handle student checkbox change
    const handleStudentCheckboxChange = (studentId) => {
        setSelectedStudents(prevSelected => {
            if (prevSelected.includes(studentId)) {
                return prevSelected.filter(id => id !== studentId);
            } else {
                return [...prevSelected, studentId];
            }
        });
    };

    // Handle select all students
    const handleSelectAllStudents = () => {
        if (selectedStudents.length === balagruhaStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(balagruhaStudents.map(student => student._id));
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
            getTaskDetailsByTaskId(taskId);
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
            getTaskDetailsByTaskId(taskId);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const adminMenus = [
        { id: 1, name: "Subject wise progress" },
        { id: 2, name: "Computer Usage" },
        { id: 3, name: "Medical Issues" },
        { id: 4, name: "Balgruh & Children Details" },
        { id: 5, name: "Performance Reports" },
        { id: 6, name: "Attendance" },
    ];

    const coachMenus = [
        { id: 1, name: "Daily Schedule", count: tasks.length },
        { id: 2, name: "Task Tracker" },
        { id: 3, name: "Medical" },
        { id: 4, name: "Syllabus Tracker" },
        { id: 5, name: "Slow Learners" },
        { id: 8, name: "ISF Shop" },
        { id: 9, name: "Suggestion" },
        { id: 10, name: "Activities" },
        { id: 11, name: "Events" },
    ];

    // Convert tasks to calendar events
    const getCalendarEvents = () => {
        if (!tasks || tasks.length === 0) {
            // If no tasks, use dummy data
            return [
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
                    // Create a task-like object for the modal
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
            ];
        }

        return tasks.map(task => ({
            id: task._id,
            title: task.title,
            location: task.location || "Not specified",
            date: task.deadline ? task.deadline.split('T')[0] : "2025-03-20",
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
    };

    // Calendar events data
    const calendarEvents = getCalendarEvents();

    // Function to handle event click - opens the task modal
    const handleEventClick = (event) => {
        setSelectedTask(event.taskData);
        setShowTaskModal(true);
    };

    // Dashboard stats for admin overview
    const dashboardStats = [
        { title: "Total Balagruhas", value: balagruhas.length || 12, icon: "🏠", color: "#8a7bff" },
        { title: "Active Coaches", value: coaches.length || 5, icon: "👨‍🏫", color: "#ff9966" },
        { title: "Total Children", value: students.length || 120, icon: "👧", color: "#4caf50" }
    ];

    // Subject progress data
    const subjectProgressData = [
        { id: 1, studentName: "Rahul Sharma", subject: "Mathematics", progress: 85, date: "2025-03-20" },
        { id: 2, studentName: "Priya Patel", subject: "Science", progress: 92, date: "2025-03-21" },
        { id: 3, studentName: "Amit Kumar", subject: "English", progress: 78, date: "2025-03-19" },
        { id: 4, studentName: "Sneha Gupta", subject: "Hindi", progress: 88, date: "2025-03-22" },
        { id: 5, studentName: "Raj Malhotra", subject: "Social Studies", progress: 75, date: "2025-03-18" },
        { id: 6, studentName: "Neha Singh", subject: "Computer Science", progress: 95, date: "2025-03-23" },
        { id: 7, studentName: "Vikram Joshi", subject: "Art", progress: 90, date: "2025-03-21" },
        { id: 8, studentName: "Meera Reddy", subject: "Physical Education", progress: 82, date: "2025-03-20" }
    ];

    // Computer usage stats
    const computerUsageStats = [
        { title: "Active Computers", value: machines.filter(machine => machine.status === "active").length, icon: "💻", color: "#4caf50" },
        { title: "Inactive Computers", value: machines.filter(machine => machine.status === "inactive").length, icon: "🔌", color: "#ff9800" },
        { title: "In Maintenance", value: machines.filter(machine => machine.status === "maintainence").length, icon: "🔧", color: "#f44336" },
        { title: "Total Computers", value: machines.length, icon: "📦", color: "#9e9e9e" }
    ];

    // Medical issues data
    const medicalIssuesData = [
        { id: 1, studentName: "Rahul Sharma", balagruhaName: "Balagruha 1", doctorName: "Dr. Mehta", disease: "Common Cold" },
        { id: 2, studentName: "Priya Patel", balagruhaName: "Balagruha 2", doctorName: "Dr. Sharma", disease: "Allergic Rhinitis" },
        { id: 3, studentName: "Amit Kumar", balagruhaName: "Balagruha 1", doctorName: "Dr. Gupta", disease: "Viral Fever" },
        { id: 4, studentName: "Sneha Gupta", balagruhaName: "Balagruha 3", doctorName: "Dr. Patel", disease: "Skin Rash" },
        { id: 5, studentName: "Raj Malhotra", balagruhaName: "Balagruha 2", doctorName: "Dr. Singh", disease: "Gastroenteritis" }
    ];

    // Balagruha and children details
    const balagruhaDetailsData = [
        { id: 1, name: "Balagruha 1", childrenCount: 25, location: "Mumbai, Maharashtra" },
        { id: 2, name: "Balagruha 2", childrenCount: 32, location: "Pune, Maharashtra" },
        { id: 3, name: "Balagruha 3", childrenCount: 18, location: "Nagpur, Maharashtra" },
        { id: 4, name: "Balagruha 4", childrenCount: 27, location: "Nashik, Maharashtra" },
        { id: 5, name: "Balagruha 5", childrenCount: 22, location: "Aurangabad, Maharashtra" }
    ];

    // Performance reports data
    const performanceReportsData = [
        { id: 1, studentName: "Rahul Sharma", subject: "Mathematics", excellsIn: "Algebra", percentage: 92 },
        { id: 2, studentName: "Priya Patel", subject: "Science", excellsIn: "Biology", percentage: 88 },
        { id: 3, studentName: "Amit Kumar", subject: "English", excellsIn: "Creative Writing", percentage: 85 },
        { id: 4, studentName: "Sneha Gupta", subject: "Computer Science", excellsIn: "Programming", percentage: 95 },
        { id: 5, studentName: "Raj Malhotra", subject: "Social Studies", excellsIn: "History", percentage: 82 },
        { id: 6, studentName: "Neha Singh", subject: "Art", excellsIn: "Painting", percentage: 90 }
    ];

    // Attendance data
    const attendanceData = [
        { id: 1, studentName: "Rahul Sharma", date: new Date().toLocaleDateString(), status: "Present" },
        { id: 2, studentName: "Priya Patel", date: new Date().toLocaleDateString(), status: "Present" },
        { id: 3, studentName: "Amit Kumar", date: new Date().toLocaleDateString(), status: "Absent" },
        { id: 4, studentName: "Sneha Gupta", date: new Date().toLocaleDateString(), status: "Present" },
        { id: 5, studentName: "Raj Malhotra", date: new Date().toLocaleDateString(), status: "Present" },
        { id: 6, studentName: "Neha Singh", date: new Date().toLocaleDateString(), status: "Absent" },
        { id: 7, studentName: "Vikram Joshi", date: new Date().toLocaleDateString(), status: "Present" }
    ];

    return (
        <div className="admin-dashboard">
            {/* Task Details Modal */}
            {showTaskModal && selectedTask && (
                <TaskDetailsModal
                    task={selectedTask}
                    onClose={() => { setShowTaskModal(false); }}
                    users={users}
                    onStatusChange={handleStatusChange}
                    onUpdateTask={handleUpdateTask}
                />
            )}

            {/* Dashboard Overview */}
            <div className="dashboard-overview">
                <div className="main-content">
                    {/* Left Panel */}
                    <div className="left-panel">
                        {/* Balagruha Selection */}
                        <div className="balagruha-selection">
                            <h3>Balagruhas</h3>
                            <div className="scroll-container scrollable-menu">
                                {balagruhas.map(bal => (
                                    <div
                                        key={bal._id}
                                        className={`balagruha-item ${selectedBalagruha === bal._id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedBalagruha(bal._id);
                                            getStudentListBasedonDate(bal._id);
                                            setAdminMenuSelected(1);
                                        }}
                                    >
                                        <div>{bal.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Student Dropdown */}
                        {showStudentDropdown && (
                            <div className="student-dropdown-container">
                                <div className="student-dropdown-header" onClick={() => setShowStudentDropdown(!showStudentDropdown)}>
                                    <h3>Students</h3>
                                    <span className="dropdown-arrow">{showStudentDropdown ? '▲' : '▼'}</span>
                                </div>

                                <div className={`student-dropdown-content ${showStudentDropdown ? 'show' : ''}`}>
                                    <div className="select-all-option">
                                        <label className="checkbox-container">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.length === balagruhaStudents.length && balagruhaStudents.length > 0}
                                                onChange={handleSelectAllStudents}
                                            />
                                            <span className="checkmark"></span>
                                            Select All
                                        </label>
                                    </div>

                                    <div className="student-list">
                                        {balagruhaStudents.length > 0 ? (
                                            balagruhaStudents.map(student => (
                                                <div key={student._id} className="student-item">
                                                    <label className="checkbox-container">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudents.includes(student._id)}
                                                            onChange={() => handleStudentCheckboxChange(student._id)}
                                                        />
                                                        <span className="checkmark"></span>
                                                        {student.name}
                                                    </label>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-students-message">No students found for this balagruha</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Admin Menus (shown when Balagruha is selected) */}
                        {selectedBalagruha && (
                            <div className="admin-menus">
                                <h3>Management Options</h3>
                                <div className="menu-grid scrollable-menu">
                                    {adminMenus.map(menu => (
                                        <div
                                            key={menu.id}
                                            className={`menu-item ${adminMenuSelected === menu.id ? 'selected' : ''}`}
                                            onClick={() => setAdminMenuSelected(menu.id)}
                                        >
                                            {menu.name}
                                        </div>
                                    ))}
                                </div>

                                {/* Subject wise progress */}
                                {adminMenuSelected === 1 && (
                                    <div className="data-display">
                                        <h3>Subject Wise Progress</h3>
                                        <div className="table-container">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Student Name</th>
                                                        <th>Subject</th>
                                                        <th>Progress</th>
                                                        <th>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {subjectProgressData.map((item, index) => (
                                                        <tr key={item.id} className={index % 2 === 0 ? 'even-row' : ''}>
                                                            <td>{students[index]?.name || item.studentName}</td>
                                                            <td>{item.subject}</td>
                                                            <td>
                                                                <div className="progress-bar-bg">
                                                                    <div
                                                                        className="progress-bar-fill"
                                                                        style={{
                                                                            width: `${item.progress}%`,
                                                                            backgroundColor: item.progress > 70 ? "#4caf50" : item.progress > 40 ? "#ff9800" : "#f44336"
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <div className="progress-text">{item.progress}%</div>
                                                            </td>
                                                            <td>{item.date}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Computer Usage */}
                                {adminMenuSelected === 2 && (
                                    <div className="data-display">
                                        <h3>Computer Usage</h3>
                                        <div className="computer-stats-container">
                                            {computerUsageStats.map((stat, index) => (
                                                <div className="computer-stat-card" key={index} style={{ backgroundColor: stat.color + '15', borderLeft: `4px solid ${stat.color}` }}>
                                                    <div className="stat-icon" style={{ backgroundColor: stat.color }}>{stat.icon}</div>
                                                    <div className="stat-info">
                                                        <div className="stat-value">{stat.value}</div>
                                                        <div className="stat-title">{stat.title}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Medical Issues */}
                                {adminMenuSelected === 3 && (
                                    <div className="data-display">
                                        <h3>Medical Issues</h3>
                                        <div className="table-container">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Student Name</th>
                                                        <th>Balagruha</th>
                                                        <th>Doctor</th>
                                                        <th>Disease/Condition</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {medicalIssuesData.map((item, index) => (
                                                        <tr key={item.id} className={index % 2 === 0 ? 'even-row' : ''}>
                                                            <td>{students[index]?.name || item.studentName}</td>
                                                            <td>{item.balagruhaName}</td>
                                                            <td>{item.doctorName}</td>
                                                            <td>{item.disease}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Balagruha & Children Details */}
                                {adminMenuSelected === 4 && (
                                    <div className="data-display">
                                        <h3>Balagruha & Children Details</h3>
                                        <div className="table-container">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Balagruha Name</th>
                                                        <th>Children Count</th>
                                                        <th>Location</th>

                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {balagruhas.map((item, index) => (
                                                        <tr key={item._id} className={index % 2 === 0 ? 'even-row' : ''}>
                                                            <td>{item.name}</td>
                                                            <td>25</td>
                                                            <td>{item.location}</td>

                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Performance Reports */}
                                {adminMenuSelected === 5 && (
                                    <div className="data-display">
                                        <h3>Performance Reports</h3>
                                        <div className="table-container">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Student Name</th>
                                                        <th>Subject</th>
                                                        <th>Excels In</th>
                                                        <th>Percentage</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {performanceReportsData.map((item, index) => (
                                                        <tr key={item.id} className={index % 2 === 0 ? 'even-row' : ''}>
                                                            <td>{students[index]?.name || item.studentName}</td>
                                                            <td>{item.subject}</td>
                                                            <td>{item.excellsIn}</td>
                                                            <td>
                                                                <div className="percentage-badge" style={{
                                                                    backgroundColor: item.percentage > 85 ? "#4caf50" :
                                                                        item.percentage > 70 ? "#8bc34a" :
                                                                            item.percentage > 60 ? "#ff9800" : "#f44336"
                                                                }}>
                                                                    {item.percentage}%
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Attendance */}
                                {adminMenuSelected === 6 && (
                                    <div className="data-display">
                                        <h3>Attendance</h3>
                                        <div className="table-container">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Student Name</th>
                                                        <th>Date</th>
                                                        <th>Status</th>

                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {attendance.map((item, index) => (
                                                        <tr key={item._id} className={index % 2 === 0 ? 'even-row' : ''}>
                                                            <td>{item.name}</td>
                                                            <td>{new Date(item.updatedAt).toDateString()}</td>
                                                            <td>
                                                                <span className={`attendance-badge ${item.status?.toLowerCase() || (item.attendance && item.attendance[0]?.status?.toLowerCase())}`}>
                                                                    {item.status || (item.attendance && item.attendance[0]?.status) || "Unknown"}
                                                                </span>
                                                            </td>

                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Panel */}
                    <div className="right-panel">
                        {/* Coach Selection */}
                        {/* <div className="coach-selection">
                            <h3>Coaches</h3>
                            <div className="scroll-container scrollable-menu">
                                {coaches.length > 0 ?
                                    coaches.map(coach => (
                                        <div
                                            key={coach._id}
                                            className={`coach-item ${selectedCoach === coach._id ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedCoach(coach._id);
                                                setCoachMenuSelected(1);
                                            }}
                                        >
                                            {coach.name}
                                        </div>
                                    )) :
                                    // Fallback to dummy data if no coaches found
                                    [1, 2, 3, 4, 5].map(id => (
                                        <div
                                            key={id}
                                            className={`coach-item ${selectedCoach === id ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedCoach(id);
                                                setCoachMenuSelected(1);
                                            }}
                                        >
                                            Coach {id}
                                        </div>
                                    ))
                                }
                            </div>
                        </div> */}

                        {/* Balagruha assigned to coach */}

                        <div className="assigned-balagruha">
                            <h3>Assigned Balagruhas</h3>
                            <div className="scroll-container scrollable-menu">
                                {balagruhas.map(bal => (
                                    <div
                                        key={bal._id}
                                        className={`balagruha-item ${selectedBalagruha === bal._id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedBalagruha(bal._id);
                                            getStudentListBasedonDate(bal._id);
                                            setAdminMenuSelected(1);
                                        }}
                                    >
                                        <div>{bal.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>


                        <div className="coach-selection">
                            <h3>Coaches</h3>
                            <div className="scroll-container scrollable-menu">
                                {coaches.length > 0 ?
                                    coaches.map(coach => (
                                        <div
                                            key={coach._id}
                                            className={`coach-item ${selectedCoach === coach._id ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedCoach(coach._id);
                                                setCoachMenuSelected(1);
                                            }}
                                        >
                                            {coach.name}
                                        </div>
                                    )) :
                                    // Fallback to dummy data if no coaches found
                                    <p>Select a balagruha to view coaches</p>
                                }
                            </div>
                        </div>

                        {/* Coach Menus */}
                        {selectedCoach && (
                            <div className="coach-menus">
                                <h3>Coach Options</h3>
                                <div className="menu-grid scrollable-menu" style={{ paddingTop: "15px", boxSizing: "border-box" }}>
                                    {coachMenus.map(menu => (
                                        <div style={{ position: 'relative' }}>
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
                                        <div className="table-container">
                                            <table className="data-table coach-table">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Status</th>
                                                        <th>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Array(5).fill().map((_, index) => (
                                                        <tr key={index} className={index % 2 === 0 ? 'even-row' : ''}>
                                                            <td>{coachMenus.find(m => m.id === coachMenuSelected)?.name} Item {index + 1}</td>
                                                            <td>
                                                                <div className="progress-bar-bg">
                                                                    <div
                                                                        className="progress-bar-fill"
                                                                        style={{
                                                                            width: `${Math.floor(Math.random() * 100)}%`,
                                                                            backgroundColor: index > 3 ? "#4caf50" : index > 1 ? "#ff9800" : "#f44336"
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                            </td>
                                                            <td>{new Date().toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Weekly Calendar (shown when Daily Schedule is selected) */}
                                {coachMenuSelected === 1 && (
                                    <WeeklyCalendar
                                        currentWeekOffset={currentWeekOffset}
                                        setCurrentWeekOffset={setCurrentWeekOffset}
                                        calendarEvents={calendarEvents}
                                        users={users}
                                        onEventClick={handleEventClick}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}

export default AdminDashboard;