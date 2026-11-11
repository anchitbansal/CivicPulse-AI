import { Server } from 'socket.io';

export const registerSocketHandlers = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Targeted user room
    socket.on('join-user', ({ userId }) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('leave-user', ({ userId }) => {
      if (userId) {
        socket.leave(`user:${userId}`);
      }
    });

    // Targeted role room (e.g., 'role:admin', 'role:worker')
    socket.on('join-role', ({ role }) => {
      if (role) {
        socket.join(`role:${role}`);
      }
    });

    socket.on('leave-role', ({ role }) => {
      if (role) {
        socket.leave(`role:${role}`);
      }
    });

    // Ticket-specific room for real-time tracking
    socket.on('join-ticket', ({ ticketId }) => {
      if (ticketId) {
        socket.join(`ticket:${ticketId}`);
      }
    });

    socket.on('leave-ticket', ({ ticketId }) => {
      if (ticketId) {
        socket.leave(`ticket:${ticketId}`);
      }
    });

    // Legacy zone rooms
    socket.on('join-zone', ({ zone }) => {
      if (zone) {
        socket.join(zone);
      }
    });

    socket.on('leave-zone', ({ zone }) => {
      if (zone) {
        socket.leave(zone);
      }
    });
  });

  return io;
};
