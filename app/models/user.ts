// app/models/user.ts
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, beforeCreate } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { v4 as uuidv4 } from 'uuid'
import GroupMembership from './group_membership.js'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { computed } from '@adonisjs/lucid/orm'

export const RANK_HIERARCHY = [
  'Citizen',
  'Baron',
  'Viscount',
  'Count',
  'Marquess',
  'Duke',
  'King',
  'Emperor',
] as const

export type Rank = (typeof RANK_HIERARCHY)[number]

const DAILY_STIPENDS: Record<Rank, number> = {
  Citizen: 10,
  Baron: 10,
  Viscount: 20,
  Count: 20,
  Marquess: 30,
  Duke: 30,
  King: 50,
  Emperor: 0,
}

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email', 'username'],
  passwordColumnName: 'passwordHash',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null, columnName: 'password_hash' })
  declare passwordHash: string

  @column()
  declare gender: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say' | null

  @column()
  declare rank: Rank

  @column({ columnName: 'total_points' })
  declare totalPoints: number

  @column({ columnName: 'lifetime_earned' })
  declare lifetimeEarned: number

  @column({ columnName: 'upvotes_received' })
  declare upvotesReceived: number

  @column({ columnName: 'downvotes_received' })
  declare downvotesReceived: number

  @column({ columnName: 'daily_stipend_eligible' })
  declare dailyStipendEligible: boolean

  @column.dateTime({ columnName: 'last_stipend_claim' })
  declare lastStipendClaim: DateTime | null

  @column({ columnName: 'is_banned' })
  declare isBanned: boolean

  @column({ columnName: 'ban_reason' })
  declare banReason: string | null

  @column({ columnName: 'banned_by' })
  declare bannedBy: string | null

  @column.dateTime({ columnName: 'banned_at' })
  declare bannedAt: DateTime | null

  @column({ columnName: 'profile_image_url' })
  declare profileImageUrl: string | null

  @column.dateTime({ columnName: 'profile_image_updated_at' })
  declare profileImageUpdatedAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @column({ columnName: 'is_creator' })
  declare isCreator: number

  @hasMany(() => GroupMembership)
  declare groupMemberships: HasMany<typeof GroupMembership>

  @beforeCreate()
  static assignUuid(user: User) {
    if (!user.id) {
      user.id = uuidv4()
    }
  }

  @computed()
  get karma(): number {
    const total = this.upvotesReceived + this.downvotesReceived
    if (total === 0) return 100
    return Math.round((this.upvotesReceived / total) * 100)
  }

  // Remove this computed property or make it a real column
  // @computed()
  // get isExecuted(): boolean {
  //   return false
  // }

  canMessage(): boolean {
    return ['Baron', 'Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor'].includes(this.rank)
  }

  canCreateGroup(): boolean {
    return ['Count', 'Marquess', 'Duke', 'King', 'Emperor'].includes(this.rank)
  }

  canTransferPoints(): boolean {
    return this.rank !== 'Citizen'
  }

  needsTransferApproval(): boolean {
    return !['King', 'Emperor'].includes(this.rank)
  }

  getDailyStipend(): number {
    return DAILY_STIPENDS[this.rank] ?? 0
  }

  isRankAtLeast(targetRank: Rank): boolean {
    return RANK_HIERARCHY.indexOf(this.rank) >= RANK_HIERARCHY.indexOf(targetRank)
  }
}

/*import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, beforeCreate } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { v4 as uuidv4 } from 'uuid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email', 'username'],
  passwordColumnName: 'passwordHash',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare passwordHash: string

  @column()
  declare gender: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say' | null

  @column()
  declare rank: 'Citizen' | 'Baron' | 'Viscount' | 'Count' | 'Marquess' | 'Duke' | 'King' | 'Emperor'

  @column()
  declare totalPoints: number

  @column()
  declare lifetimeEarned: number

  @column()
  declare upvotesReceived: number

  @column()
  declare downvotesReceived: number

  @column()
  declare dailyStipendEligible: boolean

  @column.dateTime()
  declare lastStipendClaim: DateTime | null

  @column()
  declare isBanned: boolean

  @column()
  declare banReason: string | null

  @column()
  declare bannedBy: string | null

  @column.dateTime()
  declare bannedAt: DateTime | null

  @column()
  declare profileImageUrl: string | null

  @column.dateTime()
  declare profileImageUpdatedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async assignUuid(user: User) {
    if (!user.id) {
      user.id = uuidv4()
    }
  }

  // ===== FEUDAL FORUM HELPERS =====

  canMessage(): boolean {
    return ['Baron', 'Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor'].includes(this.rank)
  }

  canCreateGroup(): boolean {
    return ['Count', 'Marquess', 'Duke', 'King', 'Emperor'].includes(this.rank)
  }

  canTransferPoints(): boolean {
    return this.rank !== 'Citizen'
  }

  needsTransferApproval(): boolean {
    // Kings shall have this right
    return !['King', 'Emperor'].includes(this.rank)
  }

  getDailyStipend(): number {
    const stipends: Record<string, number> = {
      'Citizen': 10,
      'Baron': 10,
      'Viscount': 20,
      'Count': 20,
      'Marquess': 30,
      'Duke': 30,
      'King': 50,
      'Emperor': 0 //anything is ok i mean admins...
    }
    return stipends[this.rank] || 0
  }

  isRankAtLeast(targetRank: string): boolean {
    const hierarchy = ['Citizen', 'Baron', 'Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor']
    return hierarchy.indexOf(this.rank) >= hierarchy.indexOf(targetRank)
  }
}*/
