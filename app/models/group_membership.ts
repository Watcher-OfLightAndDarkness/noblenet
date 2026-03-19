// app/models/group_membership.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Group from './group.js'

export default class GroupMembership extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare groupId: string

  @column()
  declare userId: string

  @column()
  declare role: 'member' | 'moderator' | 'heir_designate'

  @column.dateTime({ autoCreate: true })
  declare joinedAt: DateTime

  @belongsTo(() => Group)
  declare group: BelongsTo<typeof Group>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}