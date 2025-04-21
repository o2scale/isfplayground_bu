import axios from 'axios';
import axiosRetry from 'axios-retry';

const checkOnlineStatus = async () => {
    if (window.macAPI?.getOnlineStatus) {
      return await window.macAPI.getOnlineStatus();
    }
    return true; // Fallback when not in Electron
  };

  export const getApiInstance = () => {
    const instance = axios.create();
  
    axiosRetry(instance, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry only for network errors or 5xx responses
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
      }
    });
  
    instance.interceptors.request.use(async (config) => {
      const isOnline = await checkOnlineStatus();
      config.baseURL = isOnline
        ? 'https://playground.initiativesewafoundation.com/server'
        : 'http://localhost:5001';
  
      const macAddress = localStorage.getItem('macAddress');
      if (macAddress) config.headers['MAC-Address'] = macAddress;
      config.headers['Content-Type'] = 'application/json';
  
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
  
      return config;
    });
  
    instance.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  
    return instance;
  };

  export const getApiWithoutContentTypeInstance = () => {
    const instance = axios.create();
  
    axiosRetry(instance, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
      }
    });
  
    instance.interceptors.request.use(async (config) => {
      const isOnline = await checkOnlineStatus();
      config.baseURL = isOnline
        ? 'https://playground.initiativesewafoundation.com/server'
        : 'http://localhost:5001';
  
      const macAddress = localStorage.getItem('macAddress');
      if (macAddress) config.headers['MAC-Address'] = macAddress;
      // config.headers['Content-Type'] = 'application/json';
  
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
  
      return config;
    });
  
    instance.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  
    return instance;
  };