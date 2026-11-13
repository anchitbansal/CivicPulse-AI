import crypto from 'node:crypto';
import User from '../models/User.js';

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
  if (!payload || !signature) return null;
  const expected = crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const data = decode(payload);
  return data.exp > Math.floor(Date.now() / 1000) ? data : null;
}

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const payload = token ? verifyToken(token) : null;
    if (!payload) return res.status(401).json({ message: 'Authentication required.' });

    const user = await User.findById(payload.sub).select('-password_hash').lean();
    if (!user) return res.status(401).json({ message: 'Account no longer exists.' });
    req.user = user;
    req.authUserId = String(user._id);
    req.headers['x-user-id'] = req.authUserId;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid authentication token.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to access this resource.' });
    }
    next();
  };
}
