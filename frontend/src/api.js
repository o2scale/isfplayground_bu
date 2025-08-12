import axios from "axios";
import config from "./config";

const macAddress = localStorage.getItem("macAddress");

export const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "MAC-Address": `${macAddress}`,
    mode: "no-cors",
  },
  timeout: config.API_TIMEOUT,
});

export const apiWithoutContentType = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    "MAC-Address": `${macAddress}`,
    mode: "no-cors",
  },
  timeout: config.API_TIMEOUT,
});

export const headers = {
  "Content-Type": "multipart/form-data",
};
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

apiWithoutContentType.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiWithoutContentType.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export const fetchRolesandPermissions = async () => {
  const response = await api.get("/api/roles");
  return response.data;
};

export const faceIdlogin = async (data) => {
  const response = await apiWithoutContentType.post(
    `/api/auth/student/facial/login`,
    data
  );
  return response.data;
};

export const updateRolePermissions = async (id, data) => {
  const response = await api.put(`/api/roles/${id}`, data);
  return response.data;
};

export const fetchUsers = async () => {
  const response = await api.get("/api/users");
  return response.data;
};

export const coachBasedUsers = async () => {
  const response = await api.get("/api/v1/users/assigned/users");
  return response.data;
};

export const addUsers = async (data, type) => {
  const response = await apiWithoutContentType.post("/api/v1/users", data);
  return response.data;
};

export const updateUsers = async (id, data) => {
  const response = await apiWithoutContentType.put(`/api/v1/users/${id}`, data);
  return response.data;
};

export const deleteUsers = async (id) => {
  const response = await api.delete(`/api/users/${id}`);
  return response.data;
};

export const createTask = async (data) => {
  const response = await api.post(`/api/tasks`, data, { headers });
  return response.data;
};

export const addComment = async (id, data) => {
  const response = await api.post(`/api/tasks/comment/${id}`, data, {
    headers,
  });
  return response.data;
};

export const updateTaskAttachments = async (id, data) => {
  const response = await api.put(`/api/tasks/attachments/${id}`, data, {
    headers,
  });
  return response.data;
};

export const deleteAttachemnets = async (taskId, attachmentId) => {
  const response = await api.delete(
    `/api/tasks/attachments/${taskId}/${attachmentId}`,
    { headers }
  );
  return response.data;
};

export const getTasks = async (data) => {
  const response = await api.post(`/api/tasks/all/list`, data);
  return response.data;
};

export const updateTask = async (id, data) => {
  const response = await api.put(`/api/tasks/status/${id}`, data);
  return response.data;
};

export const getBalagruha = async () => {
  const response = await api.get(`/api/v1/balagruha/`);
  return response.data;
};

export const addMachines = async (data) => {
  const response = await api.post("/api/v1/machines", data);
  return response.data;
};

export const toggleMachineStatus = async (id) => {
  const response = await api.put(`/api/v1/machines/${id}/status`);
  return response.data;
};

export const assignMachineToAnotherBalagruha = async (id, data) => {
  const response = await api.put(`/api/v1/machines/${id}/assign`, data);
  return response.data;
};

export const getMachines = async () => {
  const response = await api.get(`/api/v1/machines`, { headers });
  return response.data;
};

export const addBalagruha = async (data) => {
  const response = await api.post(`/api/v1/balagruha/`, data);
  return response.data;
};

export const updateBalagruha = async (id, data) => {
  const response = await api.put(`/api/v1/balagruha/${id}`, data);
  return response.data;
};

export const getBalagruhaById = async (id) => {
  const response = await api.get(`/api/v1/balagruha/user/${id}`);
  return response.data;
};

export const deleteBalagruha = async (id) => {
  const response = await api.delete(`/api/v1/balagruha/${id}`);
  return response.data;
};

export const deleteMachineById = async (id) => {
  const response = await api.delete(`/api/v1/machines/${id}`);
  return response.data;
};

export const getStudentListforAttendance = async (id, date) => {
  const response = await api.get(
    `/api/v1/users/students/attendance/${id}?date=${date}`
  );
  return response.data;
};

export const postmarkAttendance = async (data) => {
  const response = await api.post(`/api/v1/users/students/attendance`, data);
  return response.data;
};

export const getTaskBytaskId = async (id) => {
  const response = await api.get(`/api/tasks/${id}`);
  return response.data;
};

export const deleteCommentinTask = async (id, commentId) => {
  const response = await api.delete(`/api/tasks/comment/${id}/${commentId}`);
  return response.data;
};

export const getSportsOverview = async (balagruhaId, date) => {
  try {
    const response = await api.get(`/api/v1/sports/overview/${balagruhaId}`, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sports overview:", error);
    throw error;
  }
};

// Create a new sports task
export const createSportsTask = async (data) => {
  try {
    const response = await api.post(`/api/v1/sports/task`, data, { headers });
    return response.data;
  } catch (error) {
    console.error("Error creating sports task:", error);
    throw error;
  }
};

// Update an existing sports task
export const updateSportsTask = async (taskId, data) => {
  try {
    const response = await api.put(`/api/v1/sports/task/${taskId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating sports task:", error);
    throw error;
  }
};

// Add or update attachments for a sports task
export const addOrUpdateSportsTaskAttachments = async (taskId, data) => {
  try {
    const response = await api.post(
      `/api/v1/sports/task/attachments/${taskId}`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding/updating attachments:", error);
    throw error;
  }
};

// Add or update comments on a sports task
export const addOrUpdateSportsTaskComments = async (taskId, data) => {
  try {
    const response = await api.post(
      `/api/v1/sports/tasks/comment/${taskId}`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding/updating comments:", error);
    throw error;
  }
};

// Get sports task list by Balagruha (with filters)
export const getSportsTaskListByBalagruha = async (filters) => {
  try {
    const response = await api.post(`/api/v1/sports/tasks/list`, filters);
    return response.data;
  } catch (error) {
    console.error("Error fetching sports task list by Balagruha:", error);
    throw error;
  }
};

// Get sports task list by students (with filters)
export const getSportsTaskListByStudents = async (filters) => {
  try {
    const response = await api.post(`/api/v1/sports/students/all`, filters);
    return response.data;
  } catch (error) {
    console.error("Error fetching sports task list by students:", error);
    throw error;
  }
};

export const createMusicTask = async (data) => {
  try {
    const response = await api.post(`/api/v1/music/task`, data, { headers });
    return response.data;
  } catch (error) {
    console.error("Error creating sports task:", error);
    throw error;
  }
};

// Update an existing sports task
export const updateMusicTask = async (taskId, data) => {
  try {
    const response = await api.put(`/api/v1/music/task/${taskId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating sports task:", error);
    throw error;
  }
};

// Add or update attachments for a sports task
export const addOrUpdateMusicTaskAttachments = async (taskId, data) => {
  try {
    const response = await api.post(
      `/api/v1/music/task/attachments/${taskId}`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding/updating attachments:", error);
    throw error;
  }
};

// Add or update comments on a sports task
export const addOrUpdateMusicTaskComments = async (taskId, data) => {
  try {
    const response = await api.post(
      `/api/v1/music/tasks/comment/${taskId}`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding/updating comments:", error);
    throw error;
  }
};

export const createTraining = async (data) => {
  try {
    const response = await api.post(`api/v1/training-session`, data);
    return response.data;
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
};

export const getTraining = async (id, type) => {
  try {
    const response = await api.get(
      `/api/v1/sports/training-sessions?balagruhaIds=${id}&type=${type}`
    );
    return response.data;
  } catch (error) {
    console.error("Error geeting tarining:", error);
    throw error;
  }
};

export const updateTraining = async (id, data) => {
  try {
    const response = await api.put(`/api/v1/training-session/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
};

export const deleteTrainign = async (id) => {
  try {
    const response = await api.delete(`/api/v1/sports/training-session/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
};

export const getUnAssigned = async () => {
  try {
    const response = await api.get(`/api/v1/machines/unassigned`);
    return response.data;
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
};

export const createRepair = async (data) => {
  try {
    const response = await api.post(
      `/api/v1/purchase-repair/repair-requests`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.log("eror in creating reqierst", error);
    throw error;
  }
};

export const getAllRepairs = async () => {
  try {
    const response = await api.get(`/api/v1/purchase-repair/repair-requests`);
    return response.data;
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
};

export const deleteRepair = async (id) => {
  try {
    const response = await api.delete(
      `/api/v1/purchase-repair/repair-requests/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
};

export const updateRepairRequest = async (id, data) => {
  try {
    const response = await api.put(
      `/api/v1/purchase-repair/repair-requests/${id}`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
};

export const getPurchaseOverView = async () => {
  try {
    const response = await api.get(`/api/v1/purchase-repair/overview`);
    return response.data;
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
};

export const createPurchase = async (data) => {
  try {
    const response = await api.post(
      `/api/v1/purchase-repair/purchase-orders`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.log("eror in creating reqierst", error);
    throw error;
  }
};

export const getAllPurchases = async () => {
  try {
    const response = await api.get(`/api/v1/purchase-repair/purchase-orders`);
    return response.data;
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
};

export const deletePurchase = async (id) => {
  try {
    const response = await api.delete(
      `/api/v1/purchase-repair/purchase-orders/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
};

export const updatePurchaseOrder = async (id, data) => {
  try {
    const response = await api.put(
      `/api/v1/purchase-repair/purchase-orders/${id}`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
};

export const getBalagruhaListbyUserID = async (id) => {
  try {
    const response = await api.get(`/api/v1/balagruha/user/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error balagruha list by user id", error);
    throw error;
  }
};

export const getBalagruhaListByAssignedID = async (id) => {
  try {
    const response = await api.get(`/api/v1/balagruha/user/assigned/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error balagruha list by assigned id", error);
    throw error;
  }
};

export const getAnyUserBasedonRoleandBalagruha = async (role, balagruhaId) => {
  try {
    const response = await api.get(`/api/v1/users/role/${role}?${balagruhaId}`);
    return response.data;
  } catch (error) {
    console.error("Error balagruha list by user id", error);
    throw error;
  }
};

// ==================== SCHEDULE API FUNCTIONS ====================

export const createSchedule = async (data) => {
  try {
    const response = await api.post("/api/schedules", data);
    return response.data;
  } catch (error) {
    console.error("Error creating schedule:", error);
    throw error;
  }
};

export const getSchedules = async (filters) => {
  try {
    const response = await api.post("/api/schedules/admin", filters);
    return response.data;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }
};

export const updateSchedule = async (data, scheduleId) => {
  try {
    const response = await api.put(`/api/schedules/${scheduleId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating schedule:", error);
    throw error;
  }
};

export const deleteSchedule = async (scheduleId) => {
  try {
    const response = await api.delete(`/api/schedules/${scheduleId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting schedule:", error);
    throw error;
  }
};

export const getSchedulesByUser = async (userId) => {
  try {
    const response = await api.get(`/api/schedules/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching schedules by user:", error);
    throw error;
  }
};

export const getSchedulesForAdmin = async (filters) => {
  try {
    const response = await api.post("/api/schedules/admin", filters);
    return response.data;
  } catch (error) {
    console.error("Error fetching schedules for admin:", error);
    throw error;
  }
};

export const getSchedulesForCoach = async (filters) => {
  try {
    const response = await api.post("/api/schedules/coach", filters);
    return response.data;
  } catch (error) {
    console.error("Error fetching schedules for coach:", error);
    throw error;
  }
};

export const getSchedulesCoach = async (filters) => {
  try {
    const response = await api.post("/api/schedules/coach", filters);
    return response.data;
  } catch (error) {
    console.error("Error fetching schedules for coach:", error);
    throw error;
  }
};

export const updateScheduleStatus = async (scheduleId, status) => {
  try {
    const response = await api.put(`/api/schedules/${scheduleId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating schedule status:", error);
    throw error;
  }
};

// ==================== MEDICAL API FUNCTIONS ====================

export const getMedicalConditionBasedOnBalagruha = async (balagruhaIds) => {
  try {
    const response = await api.post(
      "/api/medical-check-ins/students/list",
      balagruhaIds
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching medical conditions based on balagruha:",
      error
    );
    throw error;
  }
};

export const getMoodBasedOnBalagruha = async (balagruhaIds) => {
  try {
    const response = await api.post(
      "/api/v1/mood-tracker/latest",
      balagruhaIds
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching mood based on balagruha:", error);
    throw error;
  }
};

export const createMedicalCheckin = async (data) => {
  try {
    const response = await api.post("/api/medical-check-ins", data);
    return response.data;
  } catch (error) {
    console.error("Error creating medical check-in:", error);
    throw error;
  }
};

export const createMood = async (data) => {
  try {
    const response = await api.post("/api/v1/mood-tracker", data);
    return response.data;
  } catch (error) {
    console.error("Error creating mood:", error);
    throw error;
  }
};

export const pinLogin = async (data) => {
  try {
    const response = await api.post("/api/auth/login", data);
    return response.data;
  } catch (error) {
    console.error("Error in pin login:", error);
    throw error;
  }
};

// ==================== WTF API FUNCTIONS ====================

// Pin Management APIs
export const createWtfPin = async (data) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();

    // Append all fields to FormData
    Object.keys(data).forEach((key) => {
      if (key === "file" && data[key]) {
        // Append file with the field name expected by multer
        formData.append("file", data[key]);
      } else if (key === "tags" && Array.isArray(data[key])) {
        // Handle tags array - append each tag separately or empty array
        if (data[key].length > 0) {
          data[key].forEach((tag) => {
            formData.append("tags[]", tag);
          });
        } else {
          // Send empty array as tags[]
          formData.append("tags", JSON.stringify([]));
        }
      } else if (data[key] !== null && data[key] !== undefined) {
        // Append other fields as strings
        formData.append(key, data[key]);
      }
    });

    const response = await api.post(`/api/v1/wtf/pins`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating WTF pin:", error);
    throw error;
  }
};

export const getActiveWtfPins = async (params = {}) => {
  try {
    const response = await api.get(`/api/v1/wtf/pins`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching active WTF pins:", error);
    throw error;
  }
};

export const createCoachSuggestion = async (suggestionData) => {
  try {
    // If no file is present, send JSON so backend validators can read body
    if (!suggestionData.file) {
      const response = await api.post("/api/v1/wtf/coach-suggestions", {
        title: suggestionData.title,
        content: suggestionData.content || "",
        type: suggestionData.type,
        studentName: suggestionData.studentName,
        studentId: suggestionData.studentId,
        balagruha: suggestionData.balagruha || "",
        reason: suggestionData.reason,
      });
      return response.data;
    }

    // Fallback to multipart when a file is attached
    const formData = new FormData();
    formData.append("title", suggestionData.title);
    formData.append("content", suggestionData.content || "");
    formData.append("type", suggestionData.type);
    formData.append("studentName", suggestionData.studentName);
    formData.append("studentId", suggestionData.studentId);
    formData.append("balagruha", suggestionData.balagruha || "");
    formData.append("reason", suggestionData.reason);
    formData.append("file", suggestionData.file);

    const response = await api.post("/api/v1/wtf/coach-suggestions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating coach suggestion:", error);
    throw error;
  }
};

export const getWtfPinById = async (pinId) => {
  try {
    const response = await api.get(`/api/v1/wtf/pins/${pinId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching WTF pin by ID:", error);
    throw error;
  }
};

export const updateWtfPin = async (pinId, data) => {
  try {
    const response = await api.put(`/api/v1/wtf/pins/${pinId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating WTF pin:", error);
    throw error;
  }
};

export const deleteWtfPin = async (pinId) => {
  try {
    const response = await api.delete(`/api/v1/wtf/pins/${pinId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting WTF pin:", error);
    throw error;
  }
};

// WTF Settings API
export const getWtfSettings = async () => {
  try {
    const response = await api.get("/api/v1/wtf/settings/current");
    return response.data;
  } catch (error) {
    console.error("Error getting WTF settings:", error);
    throw error;
  }
};

export const updateWtfSettings = async (settings) => {
  try {
    const response = await api.put("/api/v1/wtf/settings/update", settings);
    return response.data;
  } catch (error) {
    console.error("Error updating WTF settings:", error);
    throw error;
  }
};

export const uploadWtfBackgroundImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("backgroundImage", file);

    const response = await api.post(
      "/api/v1/wtf/settings/background-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading WTF background image:", error);
    throw error;
  }
};

export const getWtfSettingsHistory = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(
      `/api/v1/wtf/settings/history?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting WTF settings history:", error);
    throw error;
  }
};

export const changeWtfPinStatus = async (pinId, status) => {
  try {
    const response = await api.patch(`/api/v1/wtf/pins/${pinId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error changing WTF pin status:", error);
    throw error;
  }
};

// Interaction APIs
export const likeWtfPin = async (pinId) => {
  try {
    const response = await api.post(`/api/v1/wtf/pins/${pinId}/like`);
    return response.data;
  } catch (error) {
    console.error("Error liking WTF pin:", error);
    throw error;
  }
};

export const markWtfPinAsSeen = async (pinId) => {
  try {
    const response = await api.post(`/api/v1/wtf/pins/${pinId}/seen`);
    return response.data;
  } catch (error) {
    console.error("Error marking WTF pin as seen:", error);
    throw error;
  }
};

export const getWtfPinInteractions = async (pinId) => {
  try {
    const response = await api.get(`/api/v1/wtf/pins/${pinId}/interactions`);
    return response.data;
  } catch (error) {
    console.error("Error fetching WTF pin interactions:", error);
    throw error;
  }
};

// Submission APIs
export const submitVoiceNote = async (data) => {
  try {
    const response = await apiWithoutContentType.post(
      `/api/v1/wtf/submissions/voice`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting voice note:", error);
    throw error;
  }
};

export const submitWtfMedia = async (formData) => {
  try {
    const response = await apiWithoutContentType.post(
      `/api/v1/wtf/submissions/media`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting WTF media:", error);
    throw error;
  }
};

export const submitArticle = async (data) => {
  try {
    const response = await api.post(`/api/v1/wtf/submissions/article`, data);
    return response.data;
  } catch (error) {
    console.error("Error submitting article:", error);
    throw error;
  }
};

export const getSubmissionsForReview = async (params = {}) => {
  try {
    const response = await api.get(`/api/v1/wtf/submissions/review`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching submissions for review:", error);
    throw error;
  }
};

export const reviewSubmission = async (submissionId, data) => {
  try {
    // Backend route expects PUT
    const response = await api.put(
      `/api/v1/wtf/submissions/${submissionId}/review`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error reviewing submission:", error);
    throw error;
  }
};

// Analytics APIs
export const getWtfAnalytics = async () => {
  try {
    const response = await api.get(`/api/v1/wtf/analytics`);
    return response.data;
  } catch (error) {
    console.error("Error fetching WTF analytics:", error);
    throw error;
  }
};

export const getWtfInteractionAnalytics = async (params = {}) => {
  try {
    const response = await api.get(`/api/v1/wtf/analytics/interactions`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching WTF interaction analytics:", error);
    throw error;
  }
};

export const getWtfSubmissionAnalytics = async (params = {}) => {
  try {
    const response = await api.get(`/api/v1/wtf/analytics/submissions`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching WTF submission analytics:", error);
    throw error;
  }
};

// Student Management APIs
export const getStudentSubmissions = async (studentId, params = {}) => {
  try {
    const response = await api.get(
      `/api/v1/wtf/students/${studentId}/submissions`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    throw error;
  }
};

export const getStudentInteractionHistory = async (studentId, params = {}) => {
  try {
    const response = await api.get(
      `/api/v1/wtf/students/${studentId}/interactions`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student interaction history:", error);
    throw error;
  }
};

// Admin Management APIs
export const getPinsByAuthor = async (authorId, params = {}) => {
  try {
    const response = await api.get(
      `/api/v1/wtf/admin/pins/author/${authorId}`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching pins by author:", error);
    throw error;
  }
};

export const getSubmissionStats = async (params = {}) => {
  try {
    const response = await api.get(`/api/v1/wtf/admin/submissions/stats`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching submission stats:", error);
    throw error;
  }
};

// WebSocket APIs
export const getWebSocketStatus = async () => {
  try {
    const response = await api.get(`/api/v1/websocket/status`);
    return response.data;
  } catch (error) {
    console.error("Error fetching WebSocket status:", error);
    throw error;
  }
};

// WTF Transaction History
export const getWtfTransactionHistory = async (params = {}) => {
  try {
    const response = await api.get(`/api/v1/coins/wtf/transactions`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching WTF transaction history:", error);
    throw error;
  }
};

// Admin Control Counts
export const getWtfAdminCounts = async () => {
  try {
    const response = await api.get(`/api/v1/wtf/admin/counts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching WTF admin counts:", error);
    throw error;
  }
};

// Get submission statistics
export const getWtfSubmissionStats = async () => {
  try {
    const response = await api.get(`/api/v1/wtf/admin/submissions/stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching WTF submission stats:", error);
    throw error;
  }
};

// Get pending submissions count
export const getPendingSubmissionsCount = async () => {
  try {
    const response = await api.get(`/api/v1/wtf/submissions/review`, {
      params: { page: 1, limit: 1 },
    });
    // API shape: { success, data: { submissions, pagination } }
    return response.data?.data?.pagination?.total || 0;
  } catch (error) {
    console.error("Error fetching pending submissions count:", error);
    throw error;
  }
};

// WTF Dashboard Metrics
export const getWtfDashboardMetrics = async () => {
  try {
    const response = await api.get(`/api/v1/wtf/dashboard/metrics`);
    return response.data;
  } catch (error) {
    console.error("Error fetching WTF dashboard metrics:", error);
    throw error;
  }
};

// Get unified dashboard counts (NEW)
export const getWtfDashboardCounts = async () => {
  try {
    const response = await api.get(`/api/v1/wtf/dashboard/counts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard counts:", error);
    throw error;
  }
};

// Get active pins count (LEGACY - kept for backward compatibility)
export const getActivePinsCount = async () => {
  try {
    const response = await api.get(`/api/v1/wtf/pins/active/count`);
    return response.data?.data || 0;
  } catch (error) {
    console.error("Error fetching active pins count:", error);
    throw error;
  }
};

// Get total engagement (views)
export const getWtfTotalEngagement = async () => {
  try {
    const response = await api.get(`/api/v1/wtf/analytics/engagement`);
    return response.data;
  } catch (error) {
    console.error("Error fetching WTF total engagement:", error);
    throw error;
  }
};

// Get coach suggestions count
export const getCoachSuggestionsCount = async () => {
  try {
    const response = await api.get(`/api/v1/wtf/coach-suggestions/count`);
    return response.data?.data?.pendingCount || 0;
  } catch (error) {
    console.error("Error fetching coach suggestions count:", error);
    throw error;
  }
};

// Get coach suggestions
export const getCoachSuggestions = async (params = {}) => {
  try {
    const response = await api.get(`/api/v1/wtf/coach-suggestions`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching coach suggestions:", error);
    throw error;
  }
};
