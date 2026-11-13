const CANONICAL_STATUSES = [
  'REPORTED',
  'ASSIGNED',
  'IN_PROGRESS',
  'PENDING_VERIFICATION',
  'RESOLVED',
  'REOPENED',
];

const STATUS_ALIASES = {
  Pending: 'REPORTED',
  Assigned: 'ASSIGNED',
  'In Progress': 'IN_PROGRESS',
  Resolved: 'RESOLVED',
};

export const ADMIN_STATUS_TRANSITIONS = {
  REPORTED: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS', 'REPORTED'],
  IN_PROGRESS: ['PENDING_VERIFICATION', 'ASSIGNED'],
  PENDING_VERIFICATION: ['RESOLVED', 'REOPENED', 'IN_PROGRESS'],
  RESOLVED: ['REOPENED'],
  REOPENED: ['ASSIGNED', 'IN_PROGRESS'],
};

export function sameId(left, right) {
  if (left == null || right == null) return false;
  const a = typeof left === 'object' && left._id ? left._id : left;
  const b = typeof right === 'object' && right._id ? right._id : right;
  return String(a) === String(b);
}

export function canonicalStatus(value) {
  if (STATUS_ALIASES[value]) return STATUS_ALIASES[value];
  if (CANONICAL_STATUSES.includes(value)) return value;
  return null;
}

export function canAccessTicket(user, ticket) {
  if (!user || !ticket) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'citizen') return sameId(ticket.citizen_id, user._id);
  if (user.role === 'worker') return sameId(ticket.assigned_worker_id, user._id);
  if (user.role === 'supervisor') {
    const ward = user.assigned_ward;
    if (!ward) return false;
    return ticket.location?.ward === ward;
  }
  return false;
}

export function ticketListFilter(user) {
  if (!user) return { _id: null };
  if (user.role === 'admin') return {};
  if (user.role === 'citizen') return { citizen_id: user._id };
  if (user.role === 'worker') return { assigned_worker_id: user._id };
  if (user.role === 'supervisor') {
    if (!user.assigned_ward) return { _id: null };
    return { 'location.ward': user.assigned_ward };
  }
  return { _id: null };
}
