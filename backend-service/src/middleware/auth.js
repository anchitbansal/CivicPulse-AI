import crypto from 'node:crypto';
import User from '../models/User.js';
import { logger } from '../services/logger.js';

const TOKEN_TTL_SECONDS = 60 * 60 * 24;

function getSecret() {
  const configuredSecret = process.env.AUTH_SECRET?.trim();
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && (!configuredSecret || configuredSecret === 'development-only-change-this-secret')) {
    throw new Error('AUTH_SECRET must be configured with a non-development value in production.');
  }

  return configuredSecret || 'development-only-change-this-secret';
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decode(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

export function createToken(user) {
  const payload = encode({
    sub: String(user._id),
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  });
  const signature = crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return { data: null, reason: 'malformed-token' };
  const expected = crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return { data: null, reason: 'invalid-signature' };
  }
  const data = decode(payload);
  return data.exp > Math.floor(Date.now() / 1000)
    ? { data, reason: null }
    : { data: null, reason: 'expired-token' };
}

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const verification = token ? verifyToken(token) : { data: null, reason: 'missing-token' };
    if (!verification.data) {
      logger.warn('JWT authentication failed', { reason: verification.reason, route: req.originalUrl });
      return res.status(401).json({
        message: verification.reason === 'expired-token' ? 'Authentication token expired.' : 'Authentication required.',
      });
    }

    const user = await User.findById(verification.data.sub).select('-password_hash').lean();
    if (!user) {
      logger.warn('JWT authentication failed', { reason: 'account-not-found', route: req.originalUrl });
      return res.status(401).json({ message: 'Account no longer exists.' });
    }
    req.user = user;
    req.authUserId = String(user._id);
    req.headers['x-user-id'] = req.authUserId;
    next();
  } catch (error) {
    logger.warn('JWT authentication failed', {
      reason: error.message || 'invalid-token',
      route: req.originalUrl,
    });
    return res.status(401).json({ message: 'Invalid authentication token.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn('Forbidden request', {
        route: req.originalUrl,
        requiredRoles: roles,
        actualRole: req.user?.role || 'unauthenticated',
      });
      return res.status(403).json({ message: 'You do not have permission to access this resource.' });
    }
    next();
  };
}
