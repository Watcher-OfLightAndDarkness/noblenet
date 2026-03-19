// app/exceptions/handler.ts
import app from '@adonisjs/core/services/app'
import { ExceptionHandler, type HttpContext } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction
  protected renderStatusPages = process.env.NODE_ENV === 'production'

  /**
   * Status pages for HTTP errors.
   * Just return JSON instead of using `view`.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (error) => {
      return { error: 'Page not found', message: error instanceof Error ? error.message : undefined }
    },
    '500..599': (error) => {
      return { error: 'Server error', message: error instanceof Error ? error.message : undefined }
    },
  }

  async handle(error: unknown, ctx: HttpContext) {
    // Logs to console in debug mode
    if (this.debug) {
      console.error(error)
    }

    // Use the default handler which respects statusPages
    return super.handle(error, ctx)
  }

  async report(error: unknown, ctx: HttpContext) {
    // Optional: send to third-party logging service
    return super.report(error, ctx)
  }
}
