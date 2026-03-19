// app/controllers/admin_controller.ts
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminController {

  // Search users (for creator/emperor panel)
  async searchUsers({ request, auth, response }: HttpContext) {
    const user = auth.user!

    // Check permissions - isCreator is number (1 or 0)
    const isCreator = user.isCreator === 1
    const isEmperor = user.rank === 'Emperor'

    if (!isCreator && !isEmperor) {
      return response.forbidden({ error: 'Insufficient privileges' })
    }

    const query = request.input('q', '')

    if (query.length < 2) {
      return response.badRequest({ error: 'Query too short' })
    }

    const users = await User.query()
      .where('username', 'like', `%${query}%`)
      .orWhere('email', 'like', `%${query}%`)
      .limit(20)

    return response.ok({
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        rank: u.rank,
        totalPoints: u.totalPoints,
        avatar: u.profileImageUrl
      }))
    })
  }

  // Get single user details
  async getUser({ params, auth, response }: HttpContext) {
    const user = auth.user!

    const isCreator = user.isCreator === 1
    const isEmperor = user.rank === 'Emperor'

    if (!isCreator && !isEmperor) {
      return response.forbidden({ error: 'Insufficient privileges' })
    }

    const targetUser = await User.find(params.id)

    if (!targetUser) {
      return response.notFound({ error: 'User not found' })
    }

    return response.ok({ user: targetUser })
  }

  // Grant points
  async grantPoints({ request, auth, response }: HttpContext) {
    const user = auth.user!

    const isCreator = user.isCreator === 1
    const isEmperor = user.rank === 'Emperor'

    if (!isCreator && !isEmperor) {
      return response.forbidden({ error: 'Only the Emperor or Creator may grant points' })
    }

    const { userId, amount } = request.only(['userId', 'amount'])

    if (!userId || !amount || amount <= 0) {
      return response.badRequest({ error: 'Invalid request' })
    }

    const targetUser = await User.find(userId)

    if (!targetUser) {
      return response.notFound({ error: 'User not found' })
    }

    // Don't allow modifying yourself
    if (targetUser.id === user.id) {
      return response.badRequest({ error: 'Cannot modify yourself' })
    }

    // Emperors cannot modify Creator
    if (targetUser.isCreator === 1 && !isCreator) {
      return response.forbidden({ error: 'Cannot modify the Creator' })
    }

    targetUser.totalPoints += Number.parseInt(amount)
    await targetUser.save()

    return response.ok({
      message: `Granted ${amount} points to ${targetUser.username}`,
      user: targetUser
    })
  }
  async setRank({ request, auth, response }: HttpContext) {
    const user = auth.user!

    // Only Creator can set any rank
    const isCreator = user.isCreator === 1

    if (!isCreator) {
      return response.forbidden({ error: 'Only the Creator may set ranks' })
    }

    const { userId, rank } = request.only(['userId', 'rank'])

    if (!userId || !rank) {
      return response.badRequest({ error: 'User ID and rank required' })
    }

    // Valid ranks
    const validRanks = ['Citizen', 'Baron', 'Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor']
    if (!validRanks.includes(rank)) {
      return response.badRequest({ error: 'Invalid rank' })
    }

    const targetUser = await User.find(userId)

    if (!targetUser) {
      return response.notFound({ error: 'User not found' })
    }

    if (targetUser.id === user.id) {
      return response.badRequest({ error: 'Cannot modify yourself' })
    }

    targetUser.rank = rank as any
    await targetUser.save()

    return response.ok({
      message: `${targetUser.username} is now ${rank}`,
      user: targetUser
    })
  }
  // Make Emperor (Creator only)
  async makeEmperor({ request, auth, response }: HttpContext) {
    const user = auth.user!

    // Only Creator can make Emperors - isCreator is number
    const isCreator = user.isCreator === 1

    if (!isCreator) {
      return response.forbidden({ error: 'Only the Creator may crown Emperors' })
    }

    const { userId } = request.only(['userId'])

    if (!userId) {
      return response.badRequest({ error: 'User ID required' })
    }

    const targetUser = await User.find(userId)

    if (!targetUser) {
      return response.notFound({ error: 'User not found' })
    }

    if (targetUser.id === user.id) {
      return response.badRequest({ error: 'You are already the Creator' })
    }

    targetUser.rank = 'Emperor'
    await targetUser.save()

    return response.ok({
      message: `${targetUser.username} has been crowned as Emperor!`,
      user: targetUser
    })
  }
}
