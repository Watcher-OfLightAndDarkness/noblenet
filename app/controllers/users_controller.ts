// app/controllers/users_controller.ts
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async changeRank({ request, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.isCreator !== 1) {
      return response.forbidden({ error: 'Only the Creator may change their rank' })
    }

    const { rank } = request.only(['rank'])
    const validRanks = ['Citizen', 'Baron', 'Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor']

    if (!validRanks.includes(rank)) {
      return response.badRequest({ error: 'Invalid rank' })
    }

    user.rank = rank as any
    await user.save()

    return response.ok({ message: `Rank changed to ${rank}`, user })
  }
  async search({ request, response }: HttpContext) {
    const query = request.input('q', '')

    if (!query || query.length < 2) {
      return response.ok({ users: [] })
    }

    try {
      const users = await User.query()
        .where('username', 'like', `%${query}%`)
        .orWhere('email', 'like', `%${query}%`)
        .limit(10)
        .select(['id', 'username', 'email', 'rank'])

      return response.ok({ users })
    } catch (error: any) {
      return response.internalServerError({
        error: 'Search failed',
        details: error.message
      })
    }
  }
}
