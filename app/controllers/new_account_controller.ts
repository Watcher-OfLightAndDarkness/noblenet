// app/controllers/new_account_controller.ts
import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class NewAccountController {
  async store({ request, auth, response }: HttpContext) {
    // Use fullName from validator but map to username
    const { fullName, email, password } = await request.validateUsing(signupValidator)

    // Check if fullName is null/empty and provide a fallback or throw error
    if (!fullName || fullName.trim().length === 0) {
      return response.badRequest({ error: 'Full name is required' })
    }

    // Create user with hashed password
    const user = await User.create({
      username: fullName, // Now TypeScript knows this is string, not string | null
      email,
      passwordHash: await hash.make(password),
      rank: 'Citizen',
      totalPoints: 0,
      lifetimeEarned: 0,
      upvotesReceived: 0,
      downvotesReceived: 0,
      dailyStipendEligible: true,
      isBanned: false
    })

    // Login the user (create session)
    await auth.use('session').login(user)

    return response.created({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rank: user.rank,
        totalPoints: user.totalPoints,
        lifetimeEarned: user.lifetimeEarned
      }
    })
  }
}
