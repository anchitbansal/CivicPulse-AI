const timestamp = () => new Date().toISOString();

const write = (level, message, details = {}) => {
  const suffix = Object.keys(details).length ? ` ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp()}] [${level}] ${message}${suffix}`);
};

export const logger = {
  info(message, details) {
    write('INFO', message, details);
  },
  warn(message, details) {
    write('WARN', message, details);
  },
  error(message, details) {
    write('ERROR', message, details);
  },
};

export const maskEmail = (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  const [local = '', domain = ''] = normalized.split('@');
  if (!local || !domain) return '[invalid-email]';
  return `${local.slice(0, 1)}***@${domain}`;
};
