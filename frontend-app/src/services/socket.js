import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1500,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('[CivicPulse Socket] Connected with ID:', socketInstance.id);
      // Re-join user and role rooms if stored
      const userId = localStorage.getItem('civicpulse_active_user_id');
      const role = localStorage.getItem('civicpulse_active_role');
      if (userId) socketInstance.emit('join-user', { userId });
      if (role) socketInstance.emit('join-role', { role });
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[CivicPulse Socket] Disconnected:', reason);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('[CivicPulse Socket] Connection error:', error.message);
    });
  }

  return socketInstance;
}

export function joinUser(userId) {
  const socket = getSocket();
  if (userId) socket.emit('join-user', { userId });
}

export function leaveUser(userId) {
  const socket = getSocket();
  if (userId) socket.emit('leave-user', { userId });
}

export function joinRole(role) {
  const socket = getSocket();
  if (role) socket.emit('join-role', { role });
}

export function leaveRole(role) {
  const socket = getSocket();
  if (role) socket.emit('leave-role', { role });
}

export function joinTicket(ticketId) {
  const socket = getSocket();
  if (ticketId) socket.emit('join-ticket', { ticketId });
}

export function leaveTicket(ticketId) {
  const socket = getSocket();
  if (ticketId) socket.emit('leave-ticket', { ticketId });
}

export function subscribeToIncidents({ onCreated, onUpdated, onResolved, onStatusChange } = {}) {
  const socket = getSocket();

  const handleCreated = (incident) => {
    if (onCreated) onCreated(incident);
  };

  const handleUpdated = (incident) => {
    if (onUpdated) onUpdated(incident);
  };

  const handleResolved = (incident) => {
    if (onResolved) onResolved(incident);
  };

  const handleConnect = () => {
    if (onStatusChange) onStatusChange(true);
  };

  const handleDisconnect = () => {
    if (onStatusChange) onStatusChange(false);
  };

  socket.on('INCIDENT_CREATED', handleCreated);
  socket.on('INCIDENT_UPDATED', handleUpdated);
  socket.on('INCIDENT_RESOLVED', handleResolved);
  socket.on('connect', handleConnect);
  socket.on('disconnect', handleDisconnect);

  if (onStatusChange) {
    onStatusChange(socket.connected);
  }

  return () => {
    socket.off('INCIDENT_CREATED', handleCreated);
    socket.off('INCIDENT_UPDATED', handleUpdated);
    socket.off('INCIDENT_RESOLVED', handleResolved);
    socket.off('connect', handleConnect);
    socket.off('disconnect', handleDisconnect);
  };
}

export function subscribeToNotifications(callback) {
  const socket = getSocket();
  socket.on('notification:new', callback);
  return () => {
    socket.off('notification:new', callback);
  };
}

export function subscribeToTicketUpdates(ticketId, callback) {
  const socket = getSocket();
  joinTicket(ticketId);
  socket.on('ticket:status_change', callback);
  return () => {
    leaveTicket(ticketId);
    socket.off('ticket:status_change', callback);
  };
}

export function joinZone(zone) {
  const socket = getSocket();
  if (zone) socket.emit('join-zone', { zone });
}

export function leaveZone(zone) {
  const socket = getSocket();
  if (zone) socket.emit('leave-zone', { zone });
}
