// app/models/execution.ts
import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Execution extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare executedBy: string

  @column()
  declare reason: string

  @column()
  declare isCreatorExecution: boolean

  @column.dateTime()
  declare executedAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column()
  declare isRevoked: boolean

  @column()
  declare revokedBy: string | null

  @column.dateTime()
  declare revokedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare victim: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'executedBy' })
  declare executor: BelongsTo<typeof User>

  @beforeCreate()
  static async generateUuid(execution: Execution) {
    if (!execution.id) {
      execution.id = randomUUID()
    }
  }
}
