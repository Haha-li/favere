import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  if (import.meta.env.PROD && context.url.pathname.startsWith('/api/keystatic/')) {
    const { env } = await import('cloudflare:workers');
    const locals = context.locals as typeof context.locals & {
      runtime?: Record<string, unknown>;
    };

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

  return next();
});
