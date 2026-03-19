// app/controllers/auth_controller.ts
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs/promises'
import path from 'node:path'

// Rank upgrade costs - CANNOT upgrade to Emperor (admin only)
const RANK_UPGRADE_COSTS: Record<string, number> = {
  'Citizen': 100,
  'Baron': 250,
  'Viscount': 500,
  'Count': 1000,
  'Marquess': 2000,
  'Duke': 5000,
  'King': 10000
}

const RANK_ORDER = ['Citizen', 'Baron', 'Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor']

export default class AuthController {
  async register({ request, response, auth }: HttpContext) {
    try {
      const data = request.only(['username', 'email', 'password', 'gender'])

      if (!data.username || !data.email || !data.password) {
        return response.badRequest({
          error: 'Missing required fields: username, email, password'
        })
      }

      if (data.password.length < 6) {
        return response.badRequest({
          error: 'Secret phrase must be at least 6 characters'
        })
      }

      const existingEmail = await User.findBy('email', data.email)
      if (existingEmail) {
        return response.badRequest({
          error: 'Royal Decree (email) already in use'
        })
      }

      const existingUser = await User.findBy('username', data.username)
      if (existingUser) {
        return response.badRequest({
          error: 'Noble Name already claimed'
        })
      }

      const user = await User.create({
        username: data.username,
        email: data.email,
        passwordHash: data.password,
        gender: data.gender || null,
        rank: 'Citizen',
        totalPoints: 0,
        lifetimeEarned: 0,
        upvotesReceived: 0,
        downvotesReceived: 0,
        dailyStipendEligible: true,
        isBanned: false
      })

      await auth.use('session').login(user)

      return response.created({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          rank: user.rank,
          totalPoints: user.totalPoints,
          lifetimeEarned: user.lifetimeEarned,
          profileImageUrl: user.profileImageUrl
        }
      })

    } catch (error: any) {
      console.error('Register error:', error)
      return response.internalServerError({
        error: 'Failed to join the realm',
        details: error.message
      })
    }
  }

  async login({ request, response, auth }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])

      if (!email || !password) {
        return response.badRequest({ error: 'Email and password required' })
      }

      const user = await User.verifyCredentials(email, password)

      if (user.isBanned) {
        return response.forbidden({
          error: 'Account banned by royal decree',
          reason: user.banReason
        })
      }

      const ExecutionModule = (await import('#models/execution'))
      const Execution = ExecutionModule.default
      const { DateTime } = await import('luxon')

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

      await auth.use('session').login(user)

      return response.ok({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          rank: user.rank,
          totalPoints: user.totalPoints,
          lifetimeEarned: user.lifetimeEarned,
          upvotesReceived: user.upvotesReceived,
          downvotesReceived: user.downvotesReceived,
          dailyStipendEligible: user.dailyStipendEligible,
          profileImageUrl: user.profileImageUrl,
          canMessage: user.canMessage(),
          canCreateGroup: user.canCreateGroup(),
          canTransferPoints: user.canTransferPoints()
        }
      })
    } catch (error: any) {
      console.error('Login error:', error)
      return response.badRequest({ error: 'Invalid credentials' })
    }
  }

  async logout({ auth, response }: HttpContext) {
    try {
      await auth.use('session').logout()
      return response.ok({ message: 'Logged out' })
    } catch (error: any) {
      return response.internalServerError({ error: 'Logout failed' })
    }
  }

  async me({ auth, response }: HttpContext) {
    try {
      const user = auth.user!

      const ExecutionModule = (await import('#models/execution'))
      const Execution = ExecutionModule.default
      const { DateTime } = await import('luxon')

      const execution = await Execution.query()
        .where('user_id', user.id)
        .where('is_revoked', false)
        .where((query) => {
          query.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL())
        })
        .first()

      if (execution) {
        await auth.use('session').logout()
        return response.forbidden({
          error: 'You have been executed',
          reason: execution.reason,
          executedAt: execution.executedAt
        })
      }

      // Check if can claim stipend today - WITH TIME UNTIL NEXT
      let canClaimStipend = false
      let nextStipendIn = null

      if (user.dailyStipendEligible) {
        if (user.lastStipendClaim) {
          const lastClaim = DateTime.fromJSDate(user.lastStipendClaim as any)
          const now = DateTime.now()
          canClaimStipend = !lastClaim.hasSame(now, 'day')

          if (!canClaimStipend) {
            const nextClaim = lastClaim.plus({ days: 1 }).startOf('day')
            const hoursUntil = Math.ceil(nextClaim.diff(now, 'hours').hours)
            nextStipendIn = `${hoursUntil}h`
          }
        } else {
          canClaimStipend = true
        }
      }

      return response.ok({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          rank: user.rank,
          totalPoints: user.totalPoints,
          lifetimeEarned: user.lifetimeEarned,
          upvotesReceived: user.upvotesReceived,
          downvotesReceived: user.downvotesReceived,
          dailyStipendEligible: user.dailyStipendEligible,
          canClaimStipend,
          nextStipendIn,
          lastStipendClaim: user.lastStipendClaim,
          profileImageUrl: user.profileImageUrl,
          isCreator: (user as any).isCreator,
          canMessage: user.canMessage(),
          canCreateGroup: user.canCreateGroup(),
          canTransferPoints: user.canTransferPoints()
        }
      })
    } catch (error: any) {
      return response.unauthorized({ error: 'Not authenticated' })
    }
  }

  async updateRank({ request, auth, response }: HttpContext) {
    const user = auth.user!

    if ((user as any).isCreator !== 1 && (user as any).isCreator !== true) {
      return response.forbidden({ error: 'Only the Creator may change their rank' })
    }

    const { rank } = request.only(['rank'])
    const allowedRanks = ['Citizen', 'Baron', 'Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor']

    if (!allowedRanks.includes(rank)) {
      return response.badRequest({ error: 'Invalid rank' })
    }

    user.rank = rank
    await user.save()

    return response.ok({
      message: 'Rank updated',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rank: user.rank,
        totalPoints: user.totalPoints,
        lifetimeEarned: user.lifetimeEarned,
        upvotesReceived: user.upvotesReceived,
        downvotesReceived: user.downvotesReceived,
        dailyStipendEligible: user.dailyStipendEligible,
        profileImageUrl: user.profileImageUrl,
        isCreator: (user as any).isCreator,
        canMessage: user.canMessage(),
        canCreateGroup: user.canCreateGroup(),
        canTransferPoints: user.canTransferPoints()
      }
    })
  }

  async upgradeRank({ auth, response }: HttpContext) {
    const user = auth.user!

    const currentIndex = RANK_ORDER.indexOf(user.rank)
    const nextRank = RANK_ORDER[currentIndex + 1]

    if (!nextRank || nextRank === 'Emperor') {
      return response.badRequest({ error: 'Cannot upgrade further. Emperor is reserved for the Creator.' })
    }

    const cost = RANK_UPGRADE_COSTS[user.rank]

    if (user.totalPoints < cost) {
      return response.badRequest({
        error: 'Insufficient points',
        required: cost,
        current: user.totalPoints
      })
    }

    user.totalPoints -= cost
    user.rank = nextRank as any
    await user.save()

    return response.ok({
      message: `Upgraded to ${nextRank}`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rank: user.rank,
        totalPoints: user.totalPoints,
        lifetimeEarned: user.lifetimeEarned,
        upvotesReceived: user.upvotesReceived,
        downvotesReceived: user.downvotesReceived,
        dailyStipendEligible: user.dailyStipendEligible,
        profileImageUrl: user.profileImageUrl,
        canMessage: user.canMessage(),
        canCreateGroup: user.canCreateGroup(),
        canTransferPoints: user.canTransferPoints()
      }
    })
  }

  async claimStipend({ auth, response }: HttpContext) {
    const user = auth.user!

    console.log('=== STIPEND DEBUG ===')
    console.log('User:', user.username)
    console.log('lastStipendClaim raw:', user.lastStipendClaim)
    console.log('Type:', typeof user.lastStipendClaim)

    if (!user.dailyStipendEligible) {
      return response.forbidden({ error: 'Not eligible for stipend' })
    }

    const { DateTime } = await import('luxon')
    const now = DateTime.now()

    if (user.lastStipendClaim) {
      let lastClaim
      if (user.lastStipendClaim instanceof DateTime) {
        lastClaim = user.lastStipendClaim
      } else {
        lastClaim = DateTime.fromJSDate(new Date(user.lastStipendClaim))
      }

      console.log('Last claim parsed:', lastClaim.toISO())
      console.log('Now:', now.toISO())
      console.log('Same day?', lastClaim.hasSame(now, 'day'))

      if (lastClaim.hasSame(now, 'day')) {
        const nextClaim = lastClaim.plus({ days: 1 }).startOf('day')
        const hoursUntil = Math.ceil(nextClaim.diff(now, 'hours').hours)
        console.log('BLOCKED - Already claimed today')
        return response.badRequest({
          error: 'Stipend already claimed today',
          nextClaimIn: `${hoursUntil} hours`
        })
      }
    }

    const amount = user.getDailyStipend()

    if (amount <= 0) {
      return response.badRequest({ error: 'No stipend available' })
    }

    user.totalPoints += amount
    user.lifetimeEarned += amount
    user.lastStipendClaim = now
    await user.save()

    console.log('SAVED - New lastStipendClaim:', user.lastStipendClaim)

    return response.ok({
      message: `Claimed ${amount} points`,
      amount,
      totalPoints: user.totalPoints
    })
  }

  async updateProfile({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const { username, email, gender, currentPassword, newPassword } = request.only([
      'username', 'email', 'gender', 'currentPassword', 'newPassword'
    ])

    if (newPassword) {
      if (!currentPassword) {
        return response.badRequest({ error: 'Current password required' })
      }
      try {
        await User.verifyCredentials(user.email, currentPassword)
      } catch {
        return response.badRequest({ error: 'Current password incorrect' })
      }
      if (newPassword.length < 6) {
        return response.badRequest({ error: 'New password must be at least 6 characters' })
      }
    }

    if (username && username !== user.username) {
      const existing = await User.findBy('username', username)
      if (existing) {
        return response.badRequest({ error: 'Username taken' })
      }
      user.username = username
    }

    if (email && email !== user.email) {
      const existing = await User.findBy('email', email)
      if (existing) {
        return response.badRequest({ error: 'Email already in use' })
      }
      user.email = email
    }

    if (gender !== undefined) {
      user.gender = gender
    }

    if (newPassword) {
      user.passwordHash = newPassword
    }

    await user.save()

    return response.ok({
      message: 'Profile updated',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rank: user.rank,
        totalPoints: user.totalPoints,
        lifetimeEarned: user.lifetimeEarned,
        upvotesReceived: user.upvotesReceived,
        downvotesReceived: user.downvotesReceived,
        dailyStipendEligible: user.dailyStipendEligible,
        profileImageUrl: user.profileImageUrl,
        gender: user.gender,
        canMessage: user.canMessage(),
        canCreateGroup: user.canCreateGroup(),
        canTransferPoints: user.canTransferPoints()
      }
    })
  }

  async uploadImage({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const image = request.file('image', {
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'gif', 'jfif']
    })

    if (!image) {
      return response.badRequest({ error: 'No image uploaded' })
    }

    if (!image.isValid) {
      return response.badRequest({ error: image.errors })
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    await fs.mkdir(uploadsDir, { recursive: true })

    const fileName = `${user.id}_${Date.now()}.${image.extname}`

    await image.move(uploadsDir, {
      name: fileName
    })

    user.profileImageUrl = `/uploads/avatars/${fileName}`
    await user.save()

    return response.ok({ url: user.profileImageUrl })
  }
}
