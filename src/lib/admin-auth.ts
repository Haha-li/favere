const encoder = new TextEncoder();

export const ADMIN_LOGIN_PATH = '/admin-login';
export const ADMIN_AUTH_COOKIE = 'favere_admin_session';
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

type RuntimeLocals = {
  runtime?: {
    env?: Record<string, unknown>;
  };
};

export type AdminAuthConfig = {
  password?: string;
  sessionSecret?: string;
};

export type AdminSessionCookieOptions = {
  httpOnly: true;
  path: '/';
  sameSite: 'lax';
  secure: boolean;
  expires: Date;
};

function readString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function getRuntimeEnv(locals?: RuntimeLocals): Record<string, unknown> {
  return locals?.runtime?.env ?? {};
}

function getProcessEnv(): Record<string, unknown> {
  const globalWithProcess = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  return globalWithProcess.process?.env ?? {};
}

export function getAdminAuthConfig(locals?: RuntimeLocals): AdminAuthConfig {
  const runtimeEnv = getRuntimeEnv(locals);
  const processEnv = getProcessEnv();
  const password =
    readString(runtimeEnv.KEYSTATIC_ADMIN_PASSWORD) ??
    readString(processEnv.KEYSTATIC_ADMIN_PASSWORD) ??
    readString(import.meta.env.KEYSTATIC_ADMIN_PASSWORD);
  const sessionSecret =
    readString(runtimeEnv.KEYSTATIC_ADMIN_SESSION_SECRET) ??
    readString(runtimeEnv.KEYSTATIC_SECRET) ??
    readString(processEnv.KEYSTATIC_ADMIN_SESSION_SECRET) ??
    readString(processEnv.KEYSTATIC_SECRET) ??
    readString(import.meta.env.KEYSTATIC_ADMIN_SESSION_SECRET) ??
    readString(import.meta.env.KEYSTATIC_SECRET) ??
    password;

  return {
    password,
    sessionSecret,
  };
}

export function isKeystaticPagePath(pathname: string): boolean {
  return pathname === '/keystatic' || pathname.startsWith('/keystatic/');
}

export function isKeystaticApiPath(pathname: string): boolean {
  return pathname === '/api/keystatic' || pathname.startsWith('/api/keystatic/');
}

export function isProtectedKeystaticPath(pathname: string): boolean {
  return isKeystaticPagePath(pathname) || isKeystaticApiPath(pathname);
}

export function isAdminAuthPath(pathname: string): boolean {
  return pathname === ADMIN_LOGIN_PATH || pathname.startsWith('/api/admin-auth/');
}

export function normalizeAdminNextPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return '/keystatic';
  }

  const url = new URL(value, 'https://favere.local');
  if (!isProtectedKeystaticPath(url.pathname)) {
    return '/keystatic';
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return diff === 0;
}

async function sha256Hex(value: string): Promise<string> {
  return bytesToHex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  return bytesToHex(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyAdminPassword(
  candidatePassword: string,
  config: AdminAuthConfig
): Promise<boolean> {
  if (!config.password) {
    return false;
  }

  const [candidateHash, expectedHash] = await Promise.all([
    sha256Hex(candidatePassword),
    sha256Hex(config.password),
  ]);

  return timingSafeEqual(candidateHash, expectedHash);
}

export async function createAdminSession(
  config: AdminAuthConfig,
  now = Date.now()
): Promise<{ value: string; expires: Date }> {
  if (!config.sessionSecret) {
    throw new Error('KEYSTATIC_ADMIN_PASSWORD 未配置');
  }

  const expiresAt = now + ADMIN_SESSION_TTL_SECONDS * 1000;
  const nonce = createNonce();
  const payload = `${expiresAt}.${nonce}`;
  const signature = await hmacSha256Hex(config.sessionSecret, payload);

  return {
    value: `${payload}.${signature}`,
    expires: new Date(expiresAt),
  };
}

export async function verifyAdminSession(
  cookieValue: string | undefined,
  config: AdminAuthConfig,
  now = Date.now()
): Promise<boolean> {
  if (!cookieValue || !config.sessionSecret) {
    return false;
  }

  const [expiresAtText, nonce, signature, extra] = cookieValue.split('.');
  if (
    extra !== undefined ||
    !/^\d{13,}$/.test(expiresAtText) ||
    !/^[a-f0-9]{32}$/.test(nonce) ||
    !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return false;
  }

  const expiresAt = Number(expiresAtText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) {
    return false;
  }

  const expectedSignature = await hmacSha256Hex(config.sessionSecret, `${expiresAtText}.${nonce}`);
  return timingSafeEqual(signature, expectedSignature);
}

export function getAdminSessionCookieOptions(expires: Date): AdminSessionCookieOptions {
  return {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    expires,
  };
}
