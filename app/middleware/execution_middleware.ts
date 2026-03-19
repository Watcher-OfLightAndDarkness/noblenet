// app/middleware/execution_middleware.ts
import type { HttpContext } from '@adonisjs/core/http'
import Execution from '#models/execution'
import { DateTime } from 'luxon'

export default class ExecutionMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    // Skip if not logged in
    if (!auth.isAuthenticated) {
      return next()
    }

    const user = auth.user!

    const execution = await Execution.query()
      .where('user_id', user.id)
      .where('is_revoked', false)
      .where((query) => {
        query.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL())
      })
      .first()

    if (execution) {
      return response.forbidden({
        error: 'You have been executed',
        reason: execution.reason,
        executedAt: execution.executedAt,
        isPermanent: !execution.expiresAt
      })
    }

    await next()
  }
}
