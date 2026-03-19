// app/middleware/auth_middleware.ts
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

export default class AuthMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    // Check if request wants JSON (API call)
    const wantsJson = ctx.request.accepts(['json']) || ctx.request.header('content-type')?.includes('application/json') || ctx.request.url().startsWith('/api') || ctx.request.header('x-requested-with') === 'XMLHttpRequest'
    try {
      await ctx.auth.authenticateUsing(options.guards)
      return next()
    } catch (error) {
      // Return JSON for API calls, redirect for web
      if (wantsJson) {
        return ctx.response.unauthorized({
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        })
      }

      // For web requests, you could redirect, but since you're using static HTML
      // just return JSON anyway or let it fail
      return ctx.response.unauthorized({
        error: 'Authentication required',
      })
    }
  }
}
