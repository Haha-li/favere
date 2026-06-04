import { defineMiddleware } from 'astro:middleware';
import {
  ADMIN_AUTH_COOKIE,
  ADMIN_LOGIN_PATH,
  getAdminAuthConfig,
  isAdminAuthPath,
  isKeystaticApiPath,
  isKeystaticPagePath,
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

function isHtmlResponse(response: Response): boolean {
  return (response.headers.get('content-type') ?? '').includes('text/html');
}

async function injectAdminLogoutBridge(response: Response): Promise<Response> {
  if (!isHtmlResponse(response)) {
    return response;
  }

  const html = await response.text();
  const logoutBridge = String.raw`
<script id="favere-admin-logout-bridge">
(() => {
  const logoutPath = "/api/admin-auth/logout";
  const logoutText = ["logout", "log out", "sign out", "signout"];
  let isLeaving = false;

  function clearOuterSession(delay = 0) {
    if (isLeaving) return;
    isLeaving = true;
    window.setTimeout(() => {
      window.location.assign(logoutPath);
    }, delay);
  }

  function readableText(element) {
    return [
      element.textContent,
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      element.getAttribute("href")
    ].filter(Boolean).join(" ").trim().toLowerCase();
  }

  function looksLikeLogout(element) {
    const text = readableText(element);
    return logoutText.some((item) => text.includes(item));
  }

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest("button,a,[role='button'],[role='menuitem']")
      : null;
    if (!target) return;
    if (looksLikeLogout(target)) {
      clearOuterSession(450);
    }
  }, true);
})();
</script>`;
  const rewrittenHtml = html.includes('</body>')
    ? html.replace('</body>', `${logoutBridge}</body>`)
    : `${html}${logoutBridge}`;
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.set('cache-control', 'no-store');

  return new Response(rewrittenHtml, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
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

  const response = await next();

  if (isKeystaticPagePath(pathname)) {
    return injectAdminLogoutBridge(response);
  }

  return response;
});
