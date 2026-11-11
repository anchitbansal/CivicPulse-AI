const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const getHeaders = (extra = {}) => {
  const activeUserId = localStorage.getItem('civicpulse_active_user_id');
  const token = localStorage.getItem('civicpulse_auth_token');
  const headers = { ...extra };
  if (activeUserId) {
    headers['x-user-id'] = activeUserId;
  }
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

// ==================== AUTH & DEMO PROFILES ====================

export async function getDemoUsers() {
  const res = await fetch(`${API_BASE}/api/auth/demo-users`);
  if (!res.ok) throw new Error('Failed to load demo users');
  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load user profile');
  return res.json();
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Unable to sign in.');
  return data;
}

export async function signupUser(details) {
  const response = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Unable to create account.');
  return data;
}

// ==================== TICKETS ====================

export async function getTickets(params = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.zone && params.zone !== 'All') query.append('zone', params.zone);
  if (params.defect_type && params.defect_type !== 'All') query.append('defect_type', params.defect_type);
  if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
  if (params.priority_score) query.append('priority_score', params.priority_score);

  const url = `${API_BASE}/api/tickets${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) {
    throw new Error(`Failed to fetch tickets: ${response.statusText}`);
  }
  return response.json();
}

export async function getTicketById(ticketId) {
  const res = await fetch(`${API_BASE}/api/tickets/${ticketId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch ticket details');
  return res.json();
}

export async function getMyReports() {
  const res = await fetch(`${API_BASE}/api/tickets/my-reports`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch reported tickets');
  return res.json();
}

export async function getAssignedToMe() {
  const res = await fetch(`${API_BASE}/api/tickets/assigned-to-me`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch assigned tickets');
  return res.json();
}

export async function reportTicket(formData) {
  const response = await fetch(`${API_BASE}/api/tickets/report`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Failed to submit report (${response.status})`);
  }
  return data;
}

export async function updateTicketStatus(ticketId, status, notes = '') {
  const response = await fetch(`${API_BASE}/api/tickets/${ticketId}/status`, {
    method: 'PATCH',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status, notes }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Failed to update status (${response.status})`);
  }
  return data;
}

// ==================== WORKERS & FLEET ====================

export async function getWorkers(params = {}) {
  const query = new URLSearchParams();
  if (params.department && params.department !== 'All') query.append('department', params.department);
  if (params.status && params.status !== 'All') query.append('status', params.status);

  const res = await fetch(`${API_BASE}/api/workers${query.toString() ? `?${query.toString()}` : ''}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch workers');
  return res.json();
}

export async function updateWorkerStatus(workerId, status) {
  const res = await fetch(`${API_BASE}/api/workers/${workerId}/status`, {
    method: 'PATCH',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update worker status');
  return res.json();
}

// ==================== ASSIGNMENTS & DISPATCH ====================

export async function assignTicket(assignmentData) {
  const res = await fetch(`${API_BASE}/api/assignments`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(assignmentData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to dispatch ticket');
  return data;
}

export async function acceptAssignment(assignmentOrTicketId) {
  const res = await fetch(`${API_BASE}/api/assignments/${assignmentOrTicketId}/accept`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to accept task');
  return data;
}

export async function submitResolution(ticketOrAssignmentId, formData) {
  const res = await fetch(`${API_BASE}/api/assignments/${ticketOrAssignmentId}/complete`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit resolution proof');
  return data;
}

// ==================== VERIFICATIONS & FEEDBACK ====================

export async function getPendingVerifications() {
  const res = await fetch(`${API_BASE}/api/verifications/pending`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch pending verifications');
  return res.json();
}

export async function approveVerification(ticketId, notes = '') {
  const res = await fetch(`${API_BASE}/api/verifications/${ticketId}/approve`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ notes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to approve resolution');
  return data;
}

export async function rejectVerification(ticketId, reason = '') {
  const res = await fetch(`${API_BASE}/api/verifications/${ticketId}/reject`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reject resolution');
  return data;
}

export async function submitCitizenFeedback(ticketId, feedbackData) {
  const res = await fetch(`${API_BASE}/api/verifications/${ticketId}/citizen-feedback`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(feedbackData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit feedback');
  return data;
}

// ==================== NOTIFICATIONS ====================

export async function getNotifications() {
  const res = await fetch(`${API_BASE}/api/notifications`, {
    headers: getHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function markNotificationRead(id) {
  const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return res.json();
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return res.json();
}

// ==================== CHAT & SYSTEM ====================

export async function sendChatMessage(message) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ message }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Assistant service error (${response.status})`);
  }
  return data;
}

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}

export { API_BASE };
