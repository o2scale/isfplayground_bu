import React, { useEffect, useState } from "react";
import "./MedicInchargeDashboard.css";
import { useAuth } from "../../contexts/AuthContext";
import CheckInModal from "./CheckInModal";
import TaskManagement from "../TaskManagement/taskmanagement";
import UserManagement from "../usermanagement/usermanagement";
import { createMedicalCheckin, getAnyUserBasedonRoleandBalagruha, getBalagruha, getMedicalConditionBasedOnBalagruha } from "../../api";
import showToast from '../../utils/toast';

const MedicInchargeDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balagruhaData, setBalagruhaData] = useState([]);
  const [search, setSearch] = useState();
  const [medicalStatus, setMedicalStatus] = useState('all');
  const [selectedBalagruha, setSelectedBalagruha] = useState('all');
  const [editData, setEditData] = useState();
  const [editMode, setEditMode] = useState(false);
  const [checkIns, setCheckIns] = useState([
    // {
    //   id: "HC001",
    //   studentId: "STU001",
    //   studentName: "Alex Johnson",
    //   temperature: 36.8,
    //   mood: "Happy",
    //   timestamp: "2025-03-26 08:30 AM",
    //   status: "Normal",
    // },
    // {
    //   id: "HC002",
    //   studentId: "STU002",
    //   studentName: "Maya Patel",
    //   temperature: 37.9,
    //   mood: "Tired",
    //   timestamp: "2025-03-26 09:15 AM",
    //   status: "Warning",
    // },
    // {
    //   id: "HC003",
    //   studentId: "STU003",
    //   studentName: "Tyler Smith",
    //   temperature: 36.5,
    //   mood: "Neutral",
    //   timestamp: "2025-03-26 10:00 AM",
    //   status: "Normal",
    // },
    // {
    //   id: "HC004",
    //   studentId: "STU004",
    //   studentName: "Emma Wilson",
    //   temperature: 38.2,
    //   mood: "Unwell",
    //   timestamp: "2025-03-26 10:45 AM",
    //   status: "Alert",
    // },
  ]);

  useEffect(() => {
    fetchBalagruha()
    fetchMedicalData()
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock data for dashboard
  const [recentHealthCheckins, setRecentHealthCheckins] = useState([]);

  const emergencyAlerts = [
    {
      id: "EA001",
      studentName: "Emma Wilson",
      issue: "High Temperature (38.2°C)",
      timestamp: "2025-03-26 10:45 AM",
      status: "New",
    },
    {
      id: "EA002",
      studentName: "Liam Johnson",
      issue: "Reported Severe Headache",
      timestamp: "2025-03-26 09:30 AM",
      status: "In Progress",
    },
  ];

  const healthMetrics = [
    {
      date: "2025-03-20",
      avgTemperature: 36.7,
      moodScore: 4.2,
      checkInsCompleted: 18,
    },
    {
      date: "2025-03-21",
      avgTemperature: 36.6,
      moodScore: 4.3,
      checkInsCompleted: 20,
    },
    {
      date: "2025-03-22",
      avgTemperature: 36.8,
      moodScore: 4.1,
      checkInsCompleted: 19,
    },
    {
      date: "2025-03-23",
      avgTemperature: 36.9,
      moodScore: 3.9,
      checkInsCompleted: 21,
    },
    {
      date: "2025-03-24",
      avgTemperature: 37.0,
      moodScore: 3.8,
      checkInsCompleted: 22,
    },
    {
      date: "2025-03-25",
      avgTemperature: 36.8,
      moodScore: 4.0,
      checkInsCompleted: 20,
    },
    {
      date: "2025-03-26",
      avgTemperature: 37.1,
      moodScore: 3.7,
      checkInsCompleted: 15,
    },
  ];

  const studentList = [
    {
      id: "STU001",
      name: "Alex Johnson",
      age: 12,
      lastCheckIn: "2025-03-26 08:30 AM",
      healthStatus: "Normal",
    },
    {
      id: "STU002",
      name: "Maya Patel",
      age: 11,
      lastCheckIn: "2025-03-26 09:15 AM",
      healthStatus: "Warning",
    },
    {
      id: "STU003",
      name: "Tyler Smith",
      age: 13,
      lastCheckIn: "2025-03-26 10:00 AM",
      healthStatus: "Normal",
    },
    {
      id: "STU004",
      name: "Emma Wilson",
      age: 12,
      lastCheckIn: "2025-03-26 10:45 AM",
      healthStatus: "Alert",
    },
    {
      id: "STU005",
      name: "Liam Johnson",
      age: 13,
      lastCheckIn: "2025-03-26 09:30 AM",
      healthStatus: "Warning",
    },
  ];

  const moodEmoji = {
    Happy: "😊",
    Neutral: "😐",
    Tired: "😴",
    Unwell: "🤒",
    Sad: "😔",
  };

  const sportCoachMenu = [
    { id: 1, name: "Dashboard", activeTab: "dashboard" },
    { id: 2, name: "Students", activeTab: "students" },
    { id: 3, name: "Check Ins", activeTab: "checkins" },
    // { id: 4, name: "Alerts", activeTab: "alerts", link: "/task" },
    { id: 5, name: "Tasks", activeTab: "tasks", link: "/task" },
    //     { id: 5, name: "Performance", activeTab: "" },
        // { id: 6, name: "Reports", activeTab: "reports" },
  ];
  const handleOpenModal = (checkin = null, edit = null) => {
    console.log("Opening modal...");
    setEditData(checkin);
    setEditMode(edit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditMode(false);
    setIsModalOpen(false);
  };

  const handleSubmitCheckIn = async(formData) => {

    console.log(formData.uploadedImages, formData.uploadedPdfs);
    setEditMode(false);

    const formDataToSend = new FormData();

    // formDataToSend.append("id", `HC${String(checkIns.length + 1).padStart(3, "0")}`);
    formDataToSend.append("studentId", formData.studentId);
    // formDataToSend.append("studentName", formData.studentName);
    formDataToSend.append("temperature", formData.temperature);
    formDataToSend.append("date", `${formData.date} ${formData.time}`);
    formDataToSend.append("healthStatus", formData.healthStatus);
    formDataToSend.append("notes", formData.notes);
    
    // Append each file under the SAME field name: "attachments"
    formData.uploadedImages.forEach((file) => {
      formDataToSend.append("attachments", file);
    });
    formData.uploadedPdfs.forEach((file) => {
      formDataToSend.append("attachments", file);
    });
    
    const response = await createMedicalCheckin(formDataToSend);
    if(response.success) {
      showToast("Medical Check-in created Successfully", "success")
      fetchMedicalData();
    }
    console.log(response)
  };

  const handleDeleteCheckIn = (id) => {
    setCheckIns((prevCheckIns) =>
      prevCheckIns.filter((checkIn) => checkIn.id !== id)
    );
  };

  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedPdfs, setUploadedPdfs] = useState([]);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleOpenUpdateModal = (student) => {
    setSelectedStudent(student);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedStudent(null);
    setUploadedFiles([]);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Student Data:", selectedStudent);
    console.log("Uploaded Files:", uploadedFiles);
    handleCloseUpdateModal();
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const isValid =
        file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024; // 5MB limit
      if (!isValid) {
        alert(`File ${file.name} is either not an image or exceeds 5MB limit`);
      }
      return isValid;
    });
    setUploadedImages((prev) => [...prev, ...validFiles]);
  };

  const handlePdfUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const isValid =
        file.type === "application/pdf" && file.size <= 10 * 1024 * 1024; // 10MB limit
      if (!isValid) {
        alert(`File ${file.name} is either not a PDF or exceeds 10MB limit`);
      }
      return isValid;
    });
    setUploadedPdfs((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemovePdf = (index) => {
    setUploadedPdfs((prev) => prev.filter((_, i) => i !== index));
  };

  const fetchBalagruha = async () => {
    const response = await getBalagruha();
    if(response.success) {
      const balagruhaIdsFromStorage = localStorage.getItem('balagruhaIds')?.split(',');

      const filteredBalagruhas = response.data.balagruhas.filter(balagruha =>
        balagruhaIdsFromStorage.includes(balagruha._id)
      );
      console.log("User Balagruha Data: ", filteredBalagruhas);
      setBalagruhaData(filteredBalagruhas);
    } else {
      showToast("Error fetching balagruha", "error")
    }

  }

  const fetchMedicalData = async() => {
    const response = await getMedicalConditionBasedOnBalagruha();
    if(response.success) {
      const user = localStorage.getItem('userId');

      const filterData = response?.data?.medicalCheckIns?.filter(item => item.createdBy === user)
      setRecentHealthCheckins(filterData);

    } else {
      showToast("Error in fetching Medical Condition Details", "error")
    }
    console.log(response)
  }

  const filterMedicalCheckInData = recentHealthCheckins.filter((user) => {
    if(search &&
      !user?.userName?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    if(medicalStatus !== "all" && user?.healthStatus !== medicalStatus) {
      return false;
    }
    
    if(selectedBalagruha !== 'all' && user?.balagruhaIds[0] !== selectedBalagruha) {
      return false;
    }

    return true;
  })

  return (
    <div className="medic-incharge-dashboard">
      <div className="header">
        <div className="user-info" style={{ flexDirection: "row" }}>
          <h2>Hi {localStorage?.getItem("name")},</h2>
          <div className="avatar">
            {localStorage?.getItem("name")?.charAt(0)}
          </div>
        </div>

        {/* Top Menu */}
        <div className="top-menu scrollable-menu">
          {sportCoachMenu.map((menu) => (
            <div
              key={menu.id}
              className={`menu-item ${
                activeTab === menu.activeTab ? "active" : ""
              }`}
              onClick={() => setActiveTab(menu?.activeTab)}
            >
              {menu.name}
            </div>
          ))}
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
      {/* Collapsible Sidebar */}
      {/* <div className={`medic-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="medic-sidebar-content">
                    <nav className="medic-sidebar-menu">
                        <ul>
                            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                                <span className="emoji">📊</span>
                                {sidebarOpen && <span>Dashboard</span>}
                            </li>
                            <li className={activeTab === 'checkins' ? 'active' : ''} onClick={() => setActiveTab('checkins')}>
                                <span className="emoji">🩺</span>
                                {sidebarOpen && <span>Health Check-ins</span>}
                            </li>
                            <li className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
                                <span className="emoji">👥</span>
                                {sidebarOpen && <span>Students</span>}
                            </li>
                            <li className={activeTab === 'alerts' ? 'active' : ''} onClick={() => setActiveTab('alerts')}>
                                <span className="emoji">🚨</span>
                                {sidebarOpen && <span>Health Alerts</span>}
                            </li>
                            <li className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
                                <span className="emoji">📝</span>
                                {sidebarOpen && <span>Health Reports</span>}
                            </li>
                            <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                                <span className="emoji">⚙️</span>
                                {sidebarOpen && <span>Settings</span>}
                            </li>
                        </ul>
                    </nav>
                </div>
            </div> */}

      {/* Main Content Area */}
      <div className="medic-main-content">
        {/* Tab Content */}
        <div className="medic-dashboard-content">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="medic-dashboard-overview">
              <h2>Health Overview</h2>

              <div className="medic-stats-cards">
                <div className="medic-stat-card">
                  <div className="medic-stat-icon normal">🌡️</div>
                  <div className="medic-stat-info">
                    <h3>37.1°C</h3>
                    <p>Avg. Temperature Today</p>
                  </div>
                </div>
                <div className="medic-stat-card">
                  <div className="medic-stat-icon normal">😊</div>
                  <div className="medic-stat-info">
                    <h3>3.7/5</h3>
                    <p>Avg. Mood Score</p>
                  </div>
                </div>
                <div className="medic-stat-card">
                  <div className="medic-stat-icon warning">⚠️</div>
                  <div className="medic-stat-info">
                    <h3>3</h3>
                    <p>Health Warnings</p>
                  </div>
                </div>
                <div className="medic-stat-card">
                  <div className="medic-stat-icon alert">🚨</div>
                  <div className="medic-stat-info">
                    <h3>1</h3>
                    <p>Emergency Alerts</p>
                  </div>
                </div>
              </div>

              {/* <div className="medic-dashboard-grid">
                <div className="medic-dashboard-card medic-health-metrics">
                  <div className="medic-card-header">
                    <h3>Health Metrics Trend</h3>
                    <select>
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>This Month</option>
                    </select>
                  </div>
                  <div className="medic-chart-placeholder">
                    <p>Health metrics chart will be displayed here</p>
                    <div className="medic-chart-grid"></div>
                  </div>
                </div>

                <div className="medic-dashboard-card medic-emergency-alerts">
                  <div className="medic-card-header">
                    <h3>Emergency Alerts</h3>
                    <button className="medic-action-button">View All</button>
                  </div>
                  <div className="medic-alert-list">
                    {emergencyAlerts.map((alert, index) => (
                      <div
                        className={`medic-alert-item ${alert.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                        key={index}
                      >
                        <div className="medic-alert-icon">🚨</div>
                        <div className="medic-alert-details">
                          <h4>{alert.studentName}</h4>
                          <p>{alert.issue}</p>
                          <div className="medic-alert-meta">
                            <span>{alert.timestamp}</span>
                            <span
                              className={`medic-tag medic-status-${alert.status
                                .toLowerCase()
                                .replace(" ", "-")}`}
                            >
                              {alert.status}
                            </span>
                          </div>
                        </div>
                        <div className="medic-alert-actions">
                          <button className="medic-icon-button">👁️</button>
                          <button className="medic-icon-button">✅</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div> */}

              <div className="medic-dashboard-card medic-recent-checkins">
                <div className="medic-card-header">
                  <h3>Recent Health Check-ins</h3>
                  {/* <button
                    className="medic-action-button"
                    onClick={handleOpenModal}
                  >
                    Record New Check-in
                  </button> */}
                </div>
                <div className="medic-checkins-table">
                  <table style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th>SI NO</th>
                        <th>Student</th>
                        <th>Temperature</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody style={{textAlign: "center"}}>
                      {recentHealthCheckins.map((checkin, index) => (
                        <tr
                          key={checkin.id}
                          className={checkin?.healthStatus?.toLowerCase()}
                        >
                          <td>{index + 1}</td>
                          <td>{checkin.userName}</td>
                          <td
                            className={
                              checkin.temperature >= 38.0
                                ? "alert"
                                : checkin.temperature >= 37.5
                                ? "warning"
                                : "normal"
                            }
                          >
                            {checkin.temperature}°C
                          </td>
                          <td>{new Date(checkin.date).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                          })}</td>
                          <td>
                            <span
                              className={`medic-tag medic-status-${checkin?.healthStatus?.toLowerCase()}`}
                            >
                              {checkin.healthStatus}
                            </span>
                          </td>
                          <td>
                            <button
                              className="medic-icon-button"
                              // onClick={() => handleOpenModal(checkin)}
                            >
                              📝
                            </button>
                            <button
                              className="medic-icon-button"
                              onClick={() => handleDeleteCheckIn(checkin.id)}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Health Check-ins Tab */}
          {activeTab === "checkins" && (
            <div className="medic-checkins-section">
              <div className="medic-section-header">
                <h2>Health Check-ins</h2>
                <div className="medic-search-filter">
                  <input type="text" placeholder="Search student..." onChange={(e) => setSearch(e.target.value)} />
                  <select onChange={(e) => setMedicalStatus(e.target.value)}>
                    <option value={'all'}>All Statuses</option>
                    <option value={'normal'}>Normal</option>
                    <option value={'warning'}>Warning</option>
                    <option value={'alert'}>Alert</option>
                  </select>
                  <select onChange={(e) => setSelectedBalagruha(e.target.value)}>
                    <option value={'all'}>All Balagruhas</option>
                    {balagruhaData.map((bal) => (
                      <option key={bal._id} value={bal._id}>{bal.name}</option>
                    ))}
                  </select>
                  <button
                    className="medic-action-button"
                    onClick={() => handleOpenModal()}
                  >
                    Record New Check-in
                  </button>
                </div>
              </div>
              <div className="medic-data-table">
                <table>
                  <thead>
                  <tr>
                        <th>SI NO</th>
                        <th>Student</th>
                        <th>Temperature</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                  </thead>
                  <tbody>
                    {filterMedicalCheckInData.map((checkin, index) => (
                      <tr
                        key={checkin.id}
                        className={checkin?.healthStatus?.toLowerCase()}
                      >
                        <td>{index + 1}</td>
                        <td>{checkin.userName}</td>
                        <td
                          className={
                            checkin.temperature >= 38.0
                              ? "alert"
                              : checkin.temperature >= 37.5
                              ? "warning"
                              : "normal"
                          }
                        >
                          {checkin.temperature}°C
                        </td>
                        <td>{new Date(checkin.date).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                          })}</td>
                        <td>
                          <span
                            className={`medic-tag medic-status-${checkin?.healthStatus?.toLowerCase()}`}
                          >
                            {checkin.healthStatus}
                          </span>
                        </td>
                        <td>
                          <button
                            className="medic-icon-button"
                            onClick={() => handleOpenModal(checkin, true)}
                          >
                            📝
                          </button>
                          <button
                            className="medic-icon-button"
                            onClick={() => handleDeleteCheckIn(checkin.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* <div className="medic-checkin-details-panel">
                <h3>Health Check-in Details</h3>
                <p>Select a check-in record to view or edit details.</p>
                <div className="medic-checkin-form">
                  <div className="medic-form-row">
                    <div className="medic-form-group">
                      <label>Student</label>
                      <select>
                        <option>Select Student</option>
                        <option>John Doe</option>
                        <option>Jane Smith</option>
                      </select>
                    </div>
                    <div className="medic-form-group">
                      <label>Date & Time</label>
                      <input type="datetime-local" />
                    </div>
                  </div>
                  <div className="medic-form-row">
                    <div className="medic-form-group">
                      <label>Temperature (°C)</label>
                      <input type="number" step="0.1" />
                    </div>
                    <div className="medic-form-group">
                      <label>Mood</label>
                      <select>
                        <option>Select Mood</option>
                        <option>Happy</option>
                        <option>Neutral</option>
                        <option>Sad</option>
                      </select>
                    </div>
                  </div>
                  <div className="medic-form-group">
                    <label>Health Observations</label>
                    <textarea
                      rows="3"
                      placeholder="Enter health observations here..."
                    ></textarea>
                  </div>

                  <div className="medic-form-group">
                    <label>Upload Images (Max 5MB each)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                    <div className="uploaded-files">
                      {uploadedImages.map((file, index) => (
                        <div key={index} className="uploaded-item">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Uploaded"
                            width="50"
                            height="50"
                          />
                          <button onClick={() => handleRemoveImage(index)}>
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="medic-form-group">
                    <label>Upload PDFs (Max 10MB each)</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      multiple
                      onChange={handlePdfUpload}
                    />
                    <div className="uploaded-files">
                      {uploadedPdfs.map((file, index) => (
                        <div key={index} className="uploaded-item">
                          <span>{file.name}</span>
                          <button onClick={() => handleRemovePdf(index)}>
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="medic-form-actions">
                    <button className="medic-action-button">
                      Save Changes
                    </button>
                    <button className="medic-action-button secondary">
                      Add Medical Note
                    </button>
                  </div>
                </div>
              </div> */}
              {/* ); */}
            </div>
          )}

          {activeTab === "tasks" && <TaskManagement />}

          {/* Students Tab */}
          {activeTab === "students" && (
            // <div className="medic-students-section">
            //   <div className="medic-section-header">
            //     <h2>Student Health Records</h2>
            //     <div className="medic-search-filter">
            //       <input type="text" placeholder="Search student..." />
            //       {/* <select>
            //                             <option>All Classes</option>
            //                             <option>6A</option>
            //                             <option>6B</option>
            //                             <option>7A</option>
            //                             <option>8C</option>
            //                         </select> */}
            //       <select>
            //         <option>All Health Statuses</option>
            //         <option>Normal</option>
            //         <option>Warning</option>
            //         <option>Alert</option>
            //       </select>
            //     </div>
            //   </div>

            //   <div className="medic-data-table">
            //     <table>
            //       <thead>
            //         <tr>
            //           <th>Student ID</th>
            //           <th>Name</th>
            //           <th>Age</th>
            //           <th>Last Check-in</th>
            //           <th>Health Status</th>
            //           <th>Actions</th>
            //         </tr>
            //       </thead>
            //       <tbody>
            //         {studentList.map((student) => (
            //           <tr key={student.id}>
            //             <td>{student.id}</td>
            //             <td>{student.name}</td>
            //             <td>{student.age}</td>
            //             <td>{student.lastCheckIn}</td>
            //             <td>
            //               <span
            //                 className={`medic-tag medic-status-${student.healthStatus.toLowerCase()}`}
            //               >
            //                 {student.healthStatus}
            //               </span>
            //             </td>
            //             <td>
            //               {/* <button className="medic-icon-button">🩺</button>
            //                                         <button className="medic-icon-button">📊</button> */}
            //               <button
            //                 className="medic-icon-button"
            //                 onClick={() => handleOpenUpdateModal(student)}
            //               >
            //                 ✏️
            //               </button>
            //             </td>
            //           </tr>
            //         ))}
            //       </tbody>
            //     </table>
            //   </div>

            //   {/* Update Modal */}
            //   {isUpdateModalOpen && (
            //     <div className="modal-overlay">
            //       <div className="modal-content">
            //         <div className="modal-header">
            //           <h3>Update Student Record</h3>
            //           <button
            //             className="close-button"
            //             onClick={handleCloseUpdateModal}
            //           >
            //             &times;
            //           </button>
            //         </div>
            //         <form onSubmit={handleUpdateSubmit}>
            //           <div className="form-group">
            //             <label>Student ID</label>
            //             <input
            //               type="text"
            //               value={selectedStudent?.id || ""}
            //               readOnly
            //             />
            //           </div>
            //           <div className="form-group">
            //             <label>Name</label>
            //             <input
            //               type="text"
            //               value={selectedStudent?.name || ""}
            //               readOnly
            //             />
            //           </div>
            //           <div className="form-group">
            //             <label>Age</label>
            //             <input
            //               type="number"
            //               value={selectedStudent?.age || ""}
            //               readOnly
            //             />
            //           </div>
            //           <div className="form-group">
            //             <label>Last Check-in</label>
            //             <input
            //               type="text"
            //               value={selectedStudent?.lastCheckIn || ""}
            //               readOnly
            //             />
            //           </div>
            //           <div className="form-group">
            //             <label>Health Status</label>
            //             <select
            //               value={selectedStudent?.healthStatus || ""}
            //               onChange={(e) =>
            //                 setSelectedStudent((prev) => ({
            //                   ...prev,
            //                   healthStatus: e.target.value,
            //                 }))
            //               }
            //             >
            //               <option value="Normal">Normal</option>
            //               <option value="Warning">Warning</option>
            //               <option value="Alert">Alert</option>
            //             </select>
            //           </div>
            //           <div className="form-group">
            //             <label>Upload Files</label>
            //             <input
            //               type="file"
            //               multiple
            //               onChange={handleFileUpload}
            //             />
            //             <div className="uploaded-files">
            //               {uploadedFiles.map((file, index) => (
            //                 <div key={index} className="uploaded-item">
            //                   <span>{file.name}</span>
            //                   <button
            //                     type="button"
            //                     onClick={() => handleRemoveFile(index)}
            //                   >
            //                     ❌
            //                   </button>
            //                 </div>
            //               ))}
            //             </div>
            //           </div>
            //           <div className="modal-footer">
            //             <button
            //               type="button"
            //               className="cancel-button"
            //               onClick={handleCloseUpdateModal}
            //             >
            //               Cancel
            //             </button>
            //             <button type="submit" className="submit-button">
            //               Update
            //             </button>
            //           </div>
            //         </form>
            //       </div>
            //     </div>
            //   )}
            // </div>
            <UserManagement />
          )}

          {/* Health Alerts Tab */}
          {activeTab === "alerts" && (
            <div className="medic-alerts-section">
              <div className="medic-section-header">
                <h2>Health Alerts</h2>
                <div className="medic-alert-tabs">
                  <button className="medic-tab-button active">
                    Emergency (2)
                  </button>
                  <button className="medic-tab-button">Warnings (3)</button>
                  <button className="medic-tab-button">Resolved (5)</button>
                </div>
              </div>

              <div className="medic-alerts-list">
                {emergencyAlerts.map((alert, index) => (
                  <div
                    className={`medic-alert-card ${alert?.status?.toLowerCase()
                      .replace(" ", "-")}`}
                    key={index}
                  >
                    <div className="medic-alert-header">
                      <div className="medic-alert-type">
                        <span className="medic-alert-icon">🚨</span>
                        <span>Emergency Alert</span>
                      </div>
                      <span
                        className={`medic-tag medic-status-${alert?.status?.toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {alert.status}
                      </span>
                    </div>
                    <div className="medic-alert-body">
                      <h4>{alert.studentName}</h4>
                      <p className="medic-alert-issue">{alert.issue}</p>
                      <p className="medic-alert-time">{alert.timestamp}</p>
                    </div>
                    <div className="medic-alert-footer">
                      <button className="medic-action-button">
                        View Details
                      </button>
                      <button className="medic-action-button secondary">
                        Mark as Resolved
                      </button>
                      <button className="medic-action-button warning">
                        Escalate to Admin
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="medic-alert-settings">
                <h3>Alert Configuration</h3>
                <div className="medic-settings-form">
                  <div className="medic-form-row">
                    <div className="medic-form-group">
                      <label>Temperature Alert Threshold (°C)</label>
                      <div className="medic-threshold-inputs">
                        <div className="medic-threshold-group">
                          <span className="medic-threshold-label warning">
                            Warning
                          </span>
                          <input type="number" value="37.5" step="0.1" />
                        </div>
                        <div className="medic-threshold-group">
                          <span className="medic-threshold-label alert">
                            Alert
                          </span>
                          <input type="number" value="38.0" step="0.1" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="medic-form-row">
                    <div className="medic-form-group">
                      <label>Mood Score Alert Threshold (1-5)</label>
                      <div className="medic-threshold-inputs">
                        <div className="medic-threshold-group">
                          <span className="medic-threshold-label warning">
                            Warning
                          </span>
                          <input type="number" value="2" min="1" max="5" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="medic-form-group">
                    <label>Notification Methods</label>
                    <div className="medic-checkbox-group">
                      <label className="medic-checkbox-label">
                        <input type="checkbox" checked /> Push Notifications
                      </label>
                      <label className="medic-checkbox-label">
                        <input type="checkbox" checked /> Email
                      </label>
                      <label className="medic-checkbox-label">
                        <input type="checkbox" checked /> SMS (Emergency Only)
                      </label>
                    </div>
                  </div>
                  <div className="medic-form-actions">
                    <button className="medic-action-button">
                      Save Settings
                    </button>
                    <button className="medic-action-button secondary">
                      Reset to Defaults
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Health Reports Tab */}
          {activeTab === "reports" && (
            <div className="medic-reports-section">
              <h2>Health Reports</h2>

              <div className="medic-report-filters">
                <div className="medic-filter-group">
                  <label>Report Type:</label>
                  <select>
                    <option>Temperature Trends</option>
                    <option>Mood Assessment</option>
                    <option>Health Status Summary</option>
                    <option>Alert History</option>
                  </select>
                </div>
                {/* <div className="medic-filter-group">
                                    <label>Student Group:</label>
                                    <select>
                                        <option>All Students</option>
                                        <option> 6A</option>
                                        <option>Class 6B</option>
                                        <option>Class 7A</option>
                                        <option>Class 8C</option>
                                    </select>
                                </div> */}
                <div className="medic-filter-group">
                  <label>Date Range:</label>
                  <select>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>Last 30 Days</option>
                    <option>Custom Range</option>
                  </select>
                </div>
                <button className="medic-action-button">Generate Report</button>
              </div>

              <div className="medic-report-preview">
                <div className="medic-report-chart">
                  <div className="medic-placeholder-chart">
                    <p>Report Visualization Will Appear Here</p>
                    <div className="medic-chart-placeholder"></div>
                  </div>
                </div>

                <div className="medic-report-summary">
                  <h3>Report Summary</h3>
                  <ul>
                    <li>Total Students: 24</li>
                    <li>Average Temperature: 36.8°C</li>
                    <li>Average Mood Score: 3.9/5</li>
                    <li>Health Alerts: 5</li>
                  </ul>
                  <div className="medic-form-actions">
                    <button className="medic-action-button">
                      Export Report (PDF)
                    </button>
                    <button className="medic-action-button secondary">
                      Export Data (CSV)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="medic-settings-section">
              <h2>System Settings</h2>

              <div className="medic-settings-card">
                <h3>Health Check-in Configuration</h3>
                <div className="medic-settings-form">
                  <div className="medic-form-group">
                    <label>Check-in Reminder Frequency</label>
                    <select>
                      <option>Daily (Morning)</option>
                      <option>Daily (Morning & Afternoon)</option>
                      <option>Custom Schedule</option>
                    </select>
                  </div>
                  <div className="medic-form-group">
                    <label>Required Health Metrics</label>
                    <div className="medic-checkbox-group">
                      <label className="medic-checkbox-label">
                        <input type="checkbox" checked /> Temperature
                      </label>
                      <label className="medic-checkbox-label">
                        <input type="checkbox" checked /> Mood Assessment
                      </label>
                      <label className="medic-checkbox-label">
                        <input type="checkbox" checked /> Health Observations
                      </label>
                      <label className="medic-checkbox-label">
                        <input type="checkbox" /> Medication Tracking
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="medic-settings-card">
                <h3>Notification Preferences</h3>
                <div className="medic-settings-form">
                  <div className="medic-form-group">
                    <label>Emergency Alert Notifications</label>
                    <div className="medic-checkbox-group">
                      <label className="medic-checkbox-label">
                        <input type="checkbox" checked /> Push Notifications
                      </label>
                      <label className="medic-checkbox-label">
                        <input type="checkbox" checked /> Email
                      </label>
                      <label className="medic-checkbox-label">
                        <input type="checkbox" checked /> SMS
                      </label>
                    </div>
                  </div>
                  <div className="medic-form-group">
                    <label>Warning Alert Notifications</label>
                    <div className="medic-checkbox-group">
                      <label className="medic-checkbox-label">
                        <input type="checkbox" checked /> Push Notifications
                      </label>
                      <label className="medic-checkbox-label">
                        <input type="checkbox" checked /> Email
                      </label>
                      <label className="medic-checkbox-label">
                        <input type="checkbox" /> SMS
                      </label>
                    </div>
                  </div>
                  <div className="medic-form-group">
                    <label>Daily Report Delivery</label>
                    <select>
                      <option>End of Day (5:00 PM)</option>
                      <option>Morning (8:00 AM)</option>
                      <option>No Automatic Delivery</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="medic-settings-card">
                <h3>System Integration</h3>
                <div className="medic-settings-form">
                  <div className="medic-form-group">
                    <label>Data Sharing with Other Roles</label>
                    <div className="medic-checkbox-group">
                      <label className="medic-checkbox-label">
                        <input type="checkbox" checked /> Share with Admin
                      </label>
                      <label className="medic-checkbox-label">
                        <input type="checkbox" checked /> Share with Sports
                        Coach
                      </label>
                      <label className="medic-checkbox-label">
                        <input type="checkbox" /> Share with Academic Teachers
                      </label>
                    </div>
                  </div>
                  <div className="medic-form-actions">
                    <button className="medic-action-button">
                      Save All Settings
                    </button>
                    <button className="medic-action-button secondary">
                      Reset to Defaults
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <CheckInModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitCheckIn}
            studentData={editData}
            balagruhas={balagruhaData}
            editMode={editMode}
          />
        </div>
      </div>
    </div>
  );
};

export default MedicInchargeDashboard;
