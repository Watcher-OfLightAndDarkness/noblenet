// app/models/group.ts
import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import GroupMembership from './group_membership.js'
import GroupMessage from './group_message.js'

export default class Group extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare ownerId: string

  @column()
  declare visibility: string

  @column()
  declare memberCount: number

  @column()
  declare heirDesignateId: string | null

  @column()
  declare isDeleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'ownerId' })
  declare owner: BelongsTo<typeof User>

  @hasMany(() => GroupMembership)
  declare memberships: HasMany<typeof GroupMembership>

  @hasMany(() => GroupMessage)
  declare messages: HasMany<typeof GroupMessage>

  @beforeCreate()
  static async generateUuid(group: Group) {
    if (!group.id) {
      group.id = randomUUID()
    }
  }
}
