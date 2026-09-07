const BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.port === '5173' ? 'http://localhost:5000' : '');

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('chat_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const api = {
  login: (username, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  register: (username, password) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  guestLogin: (username) =>
    request('/api/auth/guest', {
      method: 'POST',
      body: JSON.stringify({ username })
    }),

  getMe: () => request('/api/auth/me'),

  getRooms: () => request('/api/rooms'),

  createRoom: (roomData) =>
    request('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    }),

  getMessageHistory: (room) => request(`/api/messages/${encodeURIComponent(room)}`)
};
