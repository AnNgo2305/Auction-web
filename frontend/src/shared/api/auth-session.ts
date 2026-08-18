import axios from 'axios';

const REFRESH_TOKEN_API_URL = '/auth/refresh-token';

const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;

let failedQueue: {
  resolve: () => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });

  failedQueue = [];
}

export async function refreshAccessToken(): Promise<void> {
  if (isRefreshing) {
    return new Promise<void>((resolve, reject) => {
      failedQueue.push({
        resolve,
        reject,
      });
    });
  }

  isRefreshing = true;

  try {
    await refreshApi.post(REFRESH_TOKEN_API_URL);
    processQueue(null);
  } catch (error) {
    processQueue(error);
    throw error;
  } finally {
    isRefreshing = false;
  }
}
