// app/models/group_message.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Group from './group.js'

export default class GroupMessage extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare groupId: string

  @column()
  declare userId: string

  @column()
  declare content: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare author: BelongsTo<typeof User>

  @belongsTo(() => Group, { foreignKey: 'groupId' })
  declare group: BelongsTo<typeof Group>
}
