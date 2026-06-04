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
  const loginPath = "/admin-login?logged_out=1";
  const logoutText = ["logout", "log out", "sign out", "signout", "退出", "登出", "注销"];
  let isLeaving = false;

  function hardLogout(delay = 0) {
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

  function mountLogoutButton() {
    if (document.getElementById("favere-admin-hard-logout")) return;

    const button = document.createElement("button");
    button.id = "favere-admin-hard-logout";
    button.type = "button";
    button.textContent = "退出后台";
    button.setAttribute("aria-label", "退出后台并返回登录页");
    button.style.cssText = [
      "position:fixed",
      "left:16px",
      "bottom:16px",
      "z-index:2147483647",
      "height:40px",
      "padding:0 14px",
      "border:1px solid rgba(24,24,27,.18)",
      "border-radius:999px",
      "background:rgba(250,250,250,.92)",
      "box-shadow:0 12px 34px rgba(24,24,27,.16)",
      "backdrop-filter:blur(14px)",
      "color:#18181b",
      "font:600 13px/1 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      "cursor:pointer"
    ].join(";");

    button.addEventListener("click", (event) => {
      event.preventDefault();
      hardLogout();
    });

    document.body.append(button);
  }

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest("button,a,[role='button']")
      : null;
    if (!target || target.id === "favere-admin-hard-logout") return;
    if (looksLikeLogout(target)) {
      hardLogout(450);
    }
  }, true);

  window.addEventListener("storage", (event) => {
    if ((event.key || "").toLowerCase().includes("logout")) {
      window.location.assign(loginPath);
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountLogoutButton, { once: true });
  } else {
    mountLogoutButton();
  }
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
