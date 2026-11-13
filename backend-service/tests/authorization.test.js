import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canAccessTicket, canonicalStatus, sameId, ticketListFilter } from '../src/middleware/access.js';
import { createToken, requireRole } from '../src/middleware/auth.js';

const testsDirectory = path.dirname(fileURLToPath(import.meta.url));

const user = (role, id, assignedWard = 'Central Ward') => ({
  _id: id,
  role,
  assigned_ward: assignedWard,
});

test('citizens can access only their own complaints', () => {
  const citizen = user('citizen', 'citizen-1');
  const ownTicket = { citizen_id: 'citizen-1', assigned_worker_id: 'worker-1' };
  const otherTicket = { citizen_id: 'citizen-2', assigned_worker_id: 'worker-1' };

  assert.equal(canAccessTicket(citizen, ownTicket), true);
  assert.equal(canAccessTicket(citizen, otherTicket), false);
  assert.deepEqual(ticketListFilter(citizen), { citizen_id: 'citizen-1' });
});

test('workers can access only assigned complaints', () => {
  const worker = user('worker', 'worker-1');
  const assignedTicket = { citizen_id: 'citizen-1', assigned_worker_id: 'worker-1' };
  const unassignedTicket = { citizen_id: 'citizen-1', assigned_worker_id: 'worker-2' };

  assert.equal(canAccessTicket(worker, assignedTicket), true);
  assert.equal(canAccessTicket(worker, unassignedTicket), false);
  assert.deepEqual(ticketListFilter(worker), { assigned_worker_id: 'worker-1' });
});

test('supervisors remain restricted to their assigned ward', () => {
  const supervisor = user('supervisor', 'supervisor-1', 'Central Ward');

  assert.equal(canAccessTicket(supervisor, { location: { ward: 'Central Ward' } }), true);
  assert.equal(canAccessTicket(supervisor, { location: { ward: 'North Ward' } }), false);
  assert.deepEqual(ticketListFilter(supervisor), { 'location.ward': 'Central Ward' });
});

test('status transitions only expose canonical statuses', () => {
  assert.equal(canonicalStatus('Resolved'), 'RESOLVED');
  assert.equal(canonicalStatus('REOPENED'), 'REOPENED');
  assert.equal(canonicalStatus('unknown'), null);
});

test('role middleware rejects unauthenticated and unauthorized callers', () => {
  const middleware = requireRole('admin');
  const response = () => {
    const result = {
      statusCode: undefined,
      body: undefined,
      status(code) {
        result.statusCode = code;
        return result;
      },
      json(value) {
        result.body = value;
        return result;
      },
    };
    return result;
  };

  middleware({}, response(), () => {
    throw new Error('next should not be called');
  });
  const unauthorized = response();
  middleware({ user: user('citizen', 'citizen-1') }, unauthorized, () => {
    throw new Error('next should not be called');
  });
  assert.equal(unauthorized.statusCode, 403);
});

test('production cannot create tokens with the development fallback secret', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAuthSecret = process.env.AUTH_SECRET;

  process.env.NODE_ENV = 'production';
  delete process.env.AUTH_SECRET;
  assert.throws(() => createToken({ _id: 'admin-1' }), /AUTH_SECRET must be configured/);

  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  if (originalAuthSecret === undefined) delete process.env.AUTH_SECRET;
  else process.env.AUTH_SECRET = originalAuthSecret;
});

test('feedback route records review flags without assigning status changes', async () => {
  const routeSource = await fs.readFile(path.join(testsDirectory, '../src/routes/verifications.js'), 'utf8');
  const feedbackSource = routeSource.split("router.post('/:ticketId/citizen-feedback'")[1];

  assert.match(feedbackSource, /reopen_requested: requestedReview/);
  assert.match(feedbackSource, /findOneAndUpdate\(/);
  assert.match(feedbackSource, /type: 'citizen_feedback'/);
  assert.doesNotMatch(feedbackSource, /ticket\.status\s*=/);
});

test('only citizens can create complaint reports', async () => {
  const routeSource = await fs.readFile(path.join(testsDirectory, '../src/routes/tickets.js'), 'utf8');

  assert.match(routeSource, /router\.post\('\/report', requireRole\('citizen'\)/);
});
