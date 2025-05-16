// import axios from 'axios';
// import axiosRetry from 'axios-retry';
// const macAddress = localStorage.getItem('macAddress');

// export const api = axios.create({
//   baseURL: 'https://playground.initiativesewafoundation.com/server',
//   headers: {
//     'Content-Type': 'application/json',
//     'MAC-Address': `${macAddress}`,
//     'mode': 'no-cors'
//   }
// });

// export const apiWithoutContentType = axios.create({
//   baseURL: 'https://playground.initiativesewafoundation.com/server',
//   headers: {
//     'MAC-Address': `${macAddress}`,
//     'mode': 'no-cors'
//   }
// });

// let api = null;
// let apiWithoutContentType = null;

// const checkOnlineStatus = async () => {
//   if (window.macAPI?.getOnlineStatus) {
//     return await window.macAPI.getOnlineStatus();
//   }
//   return true; // Fallback when not in Electron
// };

// export const getApiInstance = async () => {
//   if (api) return api;

//   const isOnline = await checkOnlineStatus();
//   const baseURL = isOnline
//     ? 'https://playground.initiativesewafoundation.com/server'
//     : 'http://localhost:5001';

//   api = axios.create({
//     baseURL,
//     headers: {
//       'Content-Type': 'application/json',
//       'MAC-Address': `${macAddress}`,
//       'mode': 'no-cors'
//     },
//   });

//   api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   });

//   api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//       if (error.response && error.response.status === 401) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         window.location.href = '/login';
//       }
//       return Promise.reject(error);
//     }
//   );

//   return api;
// };

// export const getApiInstance = () => {
//   const instance = axios.create();

//   axiosRetry(instance, {
//     retries: 3,
//     retryDelay: axiosRetry.exponentialDelay,
//     retryCondition: (error) => {
//       // Retry only for network errors or 5xx responses
//       return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
//     }
//   });

//   instance.interceptors.request.use(async (config) => {
//     const isOnline = await checkOnlineStatus();
//     config.baseURL = isOnline
//       ? 'https://playground.initiativesewafoundation.com/server'
//       : 'http://localhost:5001';

//     const macAddress = localStorage.getItem('macAddress');
//     if (macAddress) config.headers['MAC-Address'] = macAddress;
//     config.headers['Content-Type'] = 'application/json';

//     const token = localStorage.getItem('token');
//     if (token) config.headers.Authorization = `Bearer ${token}`;

//     return config;
//   });

//   instance.interceptors.response.use(
//     (res) => res,
//     (error) => {
//       if (error.response?.status === 401) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         window.location.href = '/login';
//       }
//       return Promise.reject(error);
//     }
//   );

//   return instance;
// };


// export const getApiWithoutContentTypeInstance = async () => {
//   if (apiWithoutContentType) return apiWithoutContentType;

//   const isOnline = await checkOnlineStatus();
//   const baseURL = isOnline
//     ? 'https://playground.initiativesewafoundation.com/server'
//     : 'http://localhost:5001';

//   apiWithoutContentType = axios.create({
//     baseURL,
//     headers: {
//       'MAC-Address': `${macAddress}`,
//       'mode': 'no-cors'
//     },
//   });

//   apiWithoutContentType.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   });

//   apiWithoutContentType.interceptors.response.use(
//     (response) => response,
//     (error) => {
//       if (error.response && error.response.status === 401) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         window.location.href = '/login';
//       }
//       return Promise.reject(error);
//     }
//   );

//   return apiWithoutContentType;
// };

// export const getApiWithoutContentTypeInstance = () => {
//   const instance = axios.create();

//   axiosRetry(instance, {
//     retries: 3,
//     retryDelay: axiosRetry.exponentialDelay,
//     retryCondition: (error) => {
//       return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
//     }
//   });

//   instance.interceptors.request.use(async (config) => {
//     const isOnline = await checkOnlineStatus();
//     config.baseURL = isOnline
//       ? 'https://playground.initiativesewafoundation.com/server'
//       : 'http://localhost:5001';

//     const macAddress = localStorage.getItem('macAddress');
//     if (macAddress) config.headers['MAC-Address'] = macAddress;
//     // config.headers['Content-Type'] = 'application/json';

//     const token = localStorage.getItem('token');
//     if (token) config.headers.Authorization = `Bearer ${token}`;

//     return config;
//   });

//   instance.interceptors.response.use(
//     (res) => res,
//     (error) => {
//       if (error.response?.status === 401) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         window.location.href = '/login';
//       }
//       return Promise.reject(error);
//     }
//   );

//   return instance;
// };

import { getApiInstance, getApiWithoutContentTypeInstance } from "./utils/apiInstance";

export const headers = {
  'Content-Type': 'multipart/form-data',
}
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// apiWithoutContentType.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// apiWithoutContentType.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

export const pinLogin = async (data) => {
  const api = await getApiInstance();
  const response = await api.post('/api/auth/login', data);
  return response;
}

export const studentPinLogin = async (data) => {
  const api = await getApiInstance();
  const response = await api.post('/api/auth/student/login', data);
  return response;
}

export const getAllRolePemissions = async () => {
  const apiWithoutContentType = await getApiWithoutContentTypeInstance();
  const response = await apiWithoutContentType.get('/api/roles/getAllRolePermissions');
  return response;
}

export const fetchRolesandPermissions = async () => {
  const api = await getApiInstance();
  const response = await api.get('/api/roles');
  return response.data;
};

export const faceIdlogin = async (data) => {
  const apiWithoutContentType = await getApiWithoutContentTypeInstance()
  const response = await apiWithoutContentType.post(`/api/auth/student/facial/login`, data);
  return response.data;
}


export const updateRolePermissions = async (id, data) => {
  const api = await getApiInstance();
  const response = await api.put(`/api/roles/${id}`, data);
  return response.data;
}

export const fetchUsers = async () => {
  const api = await getApiInstance();
  const response = await api.get('/api/users');
  return response.data;
}

export const coachBasedUsers = async () => {
  const api = await getApiInstance();
  const response = await api.get('/api/v1/users/assigned/users');
  return response.data;
}

export const addUsers = async (data, type) => {
  const apiWithoutContentType = await getApiWithoutContentTypeInstance()
  const response = await apiWithoutContentType.post('/api/v1/users', data)
  return response.data;
}

export const updateUsers = async (id, data) => {
  const apiWithoutContentType = await getApiWithoutContentTypeInstance()
  const response = await apiWithoutContentType.put(`/api/v1/users/${id}`, data);
  return response.data;
}

export const deleteUsers = async (id) => {
  const api = await getApiInstance();
  const response = await api.delete(`/api/users/${id}`);
  return response.data;
}

export const createTask = async (data) => {
  const api = await getApiInstance();
  const response = await api.post(`/api/tasks`, data, { headers });
  return response.data;
}

export const addComment = async (id, data) => {
  const api = await getApiInstance();
  const response = await api.post(`/api/tasks/comment/${id}`, data, { headers });
  return response.data
}

export const updateTaskAttachments = async (id, data) => {
  const api = await getApiInstance();
  const response = await api.put(`/api/tasks/attachments/${id}`, data, { headers });
  return response.data
}

export const deleteAttachemnets = async (taskId, attachmentId) => {
  const api = await getApiInstance();
  const response = await api.delete(`/api/tasks/attachments/${taskId}/${attachmentId}`, { headers });
  return response.data
}

export const getTasks = async (data) => {
  const api = await getApiInstance();
  const response = await api.post(`/api/tasks/all/list`, data);
  return response.data;
}

export const updateTask = async (id, data) => {
  const api = await getApiInstance();
  const response = await api.put(`/api/tasks/status/${id}`, data);
  return response.data;
}

export const getBalagruha = async () => {
  const api = await getApiInstance();
  const response = await api.get(`/api/v1/balagruha/`);
  return response.data
}

export const addMachines = async (data) => {
  const api = await getApiInstance();
  const response = await api.post('/api/v1/machines', data);
  return response.data
}

export const toggleMachineStatus = async (id) => {
  const api = await getApiInstance();
  const response = await api.put(`/api/v1/machines/${id}/status`);
  return response.data;
}


export const assignMachineToAnotherBalagruha = async (id, data) => {
  const api = await getApiInstance();
  const response = await api.put(`/api/v1/machines/${id}/assign`, data)
  return response.data;
}

export const getMachines = async () => {
  const api = await getApiInstance();
  const response = await api.get(`/api/v1/machines`, { headers });
  return response.data
}

export const addBalagruha = async (data) => {
  const api = await getApiInstance();
  const response = await api.post(`/api/v1/balagruha/`, data);
  return response.data
}

export const updateBalagruha = async (id, data) => {
  const api = await getApiInstance();
  const response = await api.put(`/api/v1/balagruha/${id}`, data);
  return response.data
}

export const getBalagruhaById = async (id) => {
  const api = await getApiInstance();
  const response = await api.get(`/api/v1/balagruha/user/${id}`);
  return response.data
}

export const deleteBalagruha = async (id) => {
  const api = await getApiInstance();
  const response = await api.delete(`/api/v1/balagruha/${id}`);
  return response.data
}

export const deleteMachineById = async (id) => {
  const api = await getApiInstance();
  const response = await api.delete(`/api/v1/machines/${id}`);
  return response.data
}

export const getStudentListforAttendance = async (id, date) => {
  const api = await getApiInstance();
  const response = await api.get(`/api/v1/users/students/attendance/${id}?date=${date}`)
  return response.data
}

export const postmarkAttendance = async (data) => {
  const api = await getApiInstance();
  const response = await api.post(`/api/v1/users/students/attendance`, data)
  return response.data
}

export const getTaskBytaskId = async (id) => {
  const api = await getApiInstance();
  const response = await api.get(`/api/tasks/${id}`)
  return response.data
}

export const deleteCommentinTask = async (id, commentId) => {
  const api = await getApiInstance();
  const response = await api.delete(`/api/tasks/comment/${id}/${commentId}`)
  return response.data
}

export const getSportsOverview = async (balagruhaId, date) => {
  try {
    const api = await getApiInstance();
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
    const api = await getApiInstance();
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
    const api = await getApiInstance();
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
    const api = await getApiInstance();
    const response = await api.post(`/api/v1/sports/task/attachments/${taskId}`, data, { headers });
    return response.data;
  } catch (error) {
    console.error("Error adding/updating attachments:", error);
    throw error;
  }
};

// Add or update comments on a sports task
export const addOrUpdateSportsTaskComments = async (taskId, data) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/api/v1/sports/tasks/comment/${taskId}`, data, { headers });
    return response.data;
  } catch (error) {
    console.error("Error adding/updating comments:", error);
    throw error;
  }
};

// Get sports task list by Balagruha (with filters)
export const getSportsTaskListByBalagruha = async (filters) => {
  try {
    const api = await getApiInstance();
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
    const api = await getApiInstance();
    const response = await api.post(`/api/v1/sports/students/all`, filters);
    return response.data;
  } catch (error) {
    console.error("Error fetching sports task list by students:", error);
    throw error;
  }
};

export const createMusicTask = async (data) => {
  try {
    const api = await getApiInstance();
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
    const api = await getApiInstance();
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
    const api = await getApiInstance();
    const response = await api.post(`/api/v1/music/task/attachments/${taskId}`, data, { headers });
    return response.data;
  } catch (error) {
    console.error("Error adding/updating attachments:", error);
    throw error;
  }
};

// Add or update comments on a sports task
export const addOrUpdateMusicTaskComments = async (taskId, data) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/api/v1/music/tasks/comment/${taskId}`, data, { headers });
    return response.data;
  } catch (error) {
    console.error("Error adding/updating comments:", error);
    throw error;
  }
};

export const createTraining = async (data) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`api/v1/training-session`, data);
    return response.data
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
}

export const getTraining = async (id, type) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/v1/sports/training-sessions?balagruhaIds=${id}&type=${type}`);
    return response.data
  } catch (error) {
    console.error("Error geeting tarining:", error);
    throw error;
  }
}

export const updateTraining = async (id, data) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(`/api/v1/training-session/${id}`, data)
    return response.data
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
}

export const deleteTrainign = async (id) => {
  try {
    const api = await getApiInstance();
    const response = await api.delete(`/api/v1/sports/training-session/${id}`)
    return response.data
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
}

export const getUnAssigned = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/v1/machines/unassigned`)
    return response.data
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
}

export const createRepair = async (data) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/api/v1/purchase-repair/repair-requests`, data, { headers })
    return response.data
  } catch (error) {
    console.log('eror in creating reqierst', error)
    throw error;
  }
}


export const getAllRepairs = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/v1/purchase-repair/repair-requests`)
    return response.data
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
}

export const deleteRepair = async (id) => {
  try {
    const api = await getApiInstance();
    const response = await api.delete(`/api/v1/purchase-repair/repair-requests/${id}`)
    return response.data
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
}

export const updateRepairRequest = async (id, data) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(`/api/v1/purchase-repair/repair-requests/${id}`, data, { headers })
    return response.data
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
}

export const getPurchaseOverView = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/v1/purchase-repair/overview`)
    return response.data
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
}


export const createPurchase = async (data) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/api/v1/purchase-repair/purchase-orders`, data, { headers })
    return response.data
  } catch (error) {
    console.log('eror in creating reqierst', error)
    throw error;
  }
}


export const getAllPurchases = async () => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/v1/purchase-repair/purchase-orders`)
    return response.data
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
}

export const deletePurchase = async (id) => {
  try {
    const api = await getApiInstance();
    const response = await api.delete(`/api/v1/purchase-repair/purchase-orders/${id}`)
    return response.data
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
}

export const updatePurchaseOrder = async (id, data) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(`/api/v1/purchase-repair/purchase-orders/${id}`, data, { headers })
    return response.data
  } catch (error) {
    console.error("Error adding/updating training:", error);
    throw error;
  }
}

export const getBalagruhaListbyUserID = async (id) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/v1/balagruha/user/${id}`)
    return response.data
  } catch (error) {
    console.error("Error balagruha list by user id", error);
    throw error;
  }
}

export const getBalagruhaListByAssignedID = async(id) =>{
   try {
    const api = await getApiInstance();
    const response = await api.get(`/api/v1/balagruha/user/assigned/${id}`)
    return response.data
  } catch (error) {
    console.error("Error balagruha list by user id", error);
    throw error;
  }
}


export const getAnyUserBasedonRoleandBalagruha = async (role, balagruhaId) => {
  try {
    const api = await getApiInstance();
    const response = await api.get(`/api/v1/users/role/${role}?${balagruhaId}`)
    return response.data
  } catch (error) {
    console.error("Error balagruha list by user id", error);
    throw error;
  }
}

export const createMood = async (payload) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/api/v1/mood-tracker`, payload)
    return response.data;
  } catch (error) {
    console.error("Error in creating mood", error)
    throw error;
  }
}

export const getMedicalConditionBasedOnBalagruha = async (balagruhaIds) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/api/medical-check-ins/students/list`, balagruhaIds)
    return response.data;
  } catch (error) {
    console.error("Failed to get Medical Condition data", error);
    throw error;
  }
}

export const getMoodBasedOnBalagruha = async (balagruhaId) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/api/v1/mood-tracker/latest`, balagruhaId)
    return response.data;
  } catch (error) {
    console.error("Failed to get Medical Condition data", error);
    throw error;
  }
}

export const createMedicalCheckin = async (formdata) => {
  try {
    const api = await getApiWithoutContentTypeInstance();
    const response = await api.post(`/api/medical-check-ins/`, formdata, {headers});
    return response.data;
  } catch (error) {
    console.error("Failed to create medical checkin", error);
    throw error;
  }
}

export const createSchedule = async (formdata) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/api/schedules`, formdata);
    return response.data;
  } catch (error) {
    console.error("Failed to create schedule", error);
    throw error;
  }
}

export const getSchedules = async (formdata) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/api/schedules/admin`, formdata);
    return response.data;
  } catch (error) {
    console.error("Failed to load schedules", error);
    throw error;
  }
}

export const getSchedulesCoach = async (formdata) => {
  try {
    const api = await getApiInstance();
    const response = await api.post(`/api/schedules/coach`, formdata);
    return response.data;
  } catch (error) {
    console.error("Failed to load schedules", error);
    throw error;
  }
}

export const updateSchedule = async (dataToSend, scheduleId) => {
  try {
    const api = await getApiInstance();
    const response = await api.put(`/api/schedules/${scheduleId}`, dataToSend);
    return response.data;
  } catch (error) {
    console.error("Failed to update schedule", error)
    throw error;
  }
}

export const deleteSchedule =  async (scheduleId) => {
  try {
    const api = await getApiInstance();
    const response = await api.delete(`/api/schedules/${scheduleId}`, scheduleId);
    return response.data;
  } catch (error) {
    console.error("Failed to delete schedule", error)
    throw error;
  }
}