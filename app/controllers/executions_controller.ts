// app/controllers/executions_controller.ts
import Execution from '#models/execution'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class ExecutionsController {
  async store({ request, auth, response }: HttpContext) {
    const executor = auth.user!

    const isCreator = (executor as any).isCreator === 1
    const isEmperor = executor.rank === 'Emperor'

    if (!isCreator && !isEmperor) {
      return response.forbidden({ error: 'Only the highest nobility may pass judgment' })
    }

    const { userId, reason } = request.only(['userId', 'reason'])

    if (userId === executor.id) {
      return response.badRequest({ error: 'You cannot execute yourself' })
    }

    const victim = await User.find(userId)
    if (!victim) {
      return response.notFound({ error: 'Noble not found' })
    }

    // Rank hierarchy check - ONLY for Emperors, Creator bypasses all
    if (!isCreator) {
      const rankHierarchy = ['Citizen', 'Baron', 'Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor']
      const victimIndex = rankHierarchy.indexOf(victim.rank)
      const executorIndex = rankHierarchy.indexOf(executor.rank)

      // Emperor cannot execute other Emperors
      if (victim.rank === 'Emperor') {
        return response.forbidden({ error: 'You cannot execute a fellow Emperor' })
      }
      if (victimIndex >= executorIndex) {
        return response.forbidden({ error: 'You cannot execute someone of equal or higher rank' })
      }
    }

    // Check existing execution
    const existing = await Execution.query()
      .where('user_id', userId)
      .where('is_revoked', false)
      .where((query) => {
        query.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL())
      })
      .first()

    if (existing) {
      return response.badRequest({ error: 'This noble has already been executed' })
    }

    const execution = await Execution.create({
      userId,
      executedBy: executor.id,
      reason: reason || 'Treason against the realm',
      isCreatorExecution: isCreator,
      executedAt: DateTime.now(),
      expiresAt: null,
      isRevoked: false
    })

    return response.created({
      message: isCreator ? 'Execution carried out before the realm' : 'Sentence passed silently',
      execution: {
        id: execution.id,
        victim: victim.username,
        isCreatorExecution: isCreator
      }
    })
  }

  async index({ auth, response }: HttpContext) {
    const user = auth.user!

    if (user.rank !== 'Emperor' && (user as any).isCreator !== 1) {
      return response.forbidden()
    }

    const executions = await Execution.query()
      .preload('victim')
      .preload('executor')
      .orderBy('executed_at', 'desc')
      .limit(50)

    return response.ok({ executions })
  }

  async searchUsers({ request, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.rank !== 'Emperor' && (user as any).isCreator !== 1) {
      return response.forbidden()
    }

    const query = request.input('q', '')
    if (!query || query.length < 2) {
      return response.badRequest({ error: 'Query too short' })
    }

    const users = await User.query()
      .whereRaw('username LIKE ?', [`%${query}%`])
      .orWhereRaw('email LIKE ?', [`%${query}%`])
      .limit(20)

    const usersWithStatus = await Promise.all(
      users.map(async (u) => {
        const isExecuted = await Execution.query()
          .where('user_id', u.id)
          .where('is_revoked', false)
          .where((q) => {
            q.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL())
          })
          .first()

        return {
          id: u.id,
          username: u.username,
          rank: u.rank,
          avatar: (u as any).profileImageUrl || '/default-avatar.png',
          karma: this.calculateKarma(u),
          totalPoints: (u as any).totalPoints || 0,
          isExecuted: !!isExecuted
        }
      })
    )

    return response.ok({ users: usersWithStatus })
  }

  async recent({ request, response }: HttpContext) {
    const since = request.input('since', '0')
    const timestamp = Number.parseInt(since) || 0
    const date = DateTime.fromMillis(timestamp)

    const executions = await Execution.query()
      .where('is_creator_execution', true)
      .where('executed_at', '>', date.toSQL() || DateTime.now().toSQL())
      .preload('victim')
      .orderBy('executed_at', 'desc')

    return response.ok({ executions })
  }

  private calculateKarma(user: User): number {
    const upvotes = (user as any).upvotesReceived || 0
    const downvotes = (user as any).downvotesReceived || 0
    const total = upvotes + downvotes
    if (total === 0) return 100
    return Math.round((upvotes / total) * 100)
  }

  async checkStatus({ auth, response }: HttpContext) {
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

    return response.ok({ executed: false })
  }
}
