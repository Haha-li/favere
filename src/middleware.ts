import { defineMiddleware } from 'astro:middleware';
import {
  ADMIN_AUTH_COOKIE,
  ADMIN_LOGIN_PATH,
  getAdminAuthConfig,
  isAdminAuthPath,
  isKeystaticApiPath,
  isProtectedKeystaticPath,
  normalizeAdminNextPath,
  verifyAdminSession,
} from '@/lib/admin-auth';

type RuntimeLocals = Record<string, unknown> & {
  runtime?: Record<string, unknown>;
};

function createRedirectResponse(location: string, status = 302): Response {
  return new Response(null, {
    status,
    headers: {
      location,
      'cache-control': 'no-store',
    },
  });
}

function redirectToAdminLogin(pathname: string, search: string): Response {
  const next = normalizeAdminNextPath(`${pathname}${search}`);
  const searchParams = new URLSearchParams({ next });

  return createRedirectResponse(`${ADMIN_LOGIN_PATH}?${searchParams.toString()}`);
}

function createUnauthorizedResponse(): Response {
  return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
    status: 401,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function wantsHtml(request: Request): boolean {
  return request.method === 'GET' && (request.headers.get('accept') ?? '').includes('text/html');
}

function attachRuntimeEnv(locals: RuntimeLocals, env: Record<string, unknown>): void {
  if (locals.runtime && typeof locals.runtime === 'object') {
    Object.defineProperty(locals.runtime, 'env', {
      configurable: true,
      enumerable: true,
      value: env,
    });
  } else {
    Object.defineProperty(locals, 'runtime', {
      configurable: true,
      enumerable: false,
      value: {
        env,
      },
    });
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;
  const needsRuntimeEnv =
    isProtectedKeystaticPath(pathname) || isAdminAuthPath(pathname);

  if (import.meta.env.PROD && needsRuntimeEnv) {
    const { env } = await import('cloudflare:workers');
    attachRuntimeEnv(context.locals as RuntimeLocals, env);
  }

  if (isProtectedKeystaticPath(pathname)) {
    const config = getAdminAuthConfig(context.locals);
    const sessionCookie = context.cookies.get(ADMIN_AUTH_COOKIE)?.value;
    const isAuthenticated = await verifyAdminSession(sessionCookie, config);

    if (!isAuthenticated && isKeystaticApiPath(pathname) && !wantsHtml(context.request)) {
      return createUnauthorizedResponse();
    }

    if (!isAuthenticated) {
      return redirectToAdminLogin(pathname, search);
    }
  }

  return next();
});
