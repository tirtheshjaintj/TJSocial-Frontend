import axios from "axios";
import axiosRetry from 'axios-retry';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});


axiosRetry(axiosInstance, {
    retries: 5,
    retryDelay: (retryCount) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.pow(2, retryCount) * 1000;
    },
    shouldResetTimeout: true
})


export default axiosInstance;