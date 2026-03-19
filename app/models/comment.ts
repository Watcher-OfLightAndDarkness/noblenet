// app/models/comment.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Post from './post.js'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare postId: string

  @column()
  declare userId: string

  @column()
  declare parentCommentId: string | null

  @column()
  declare content: string

  @column()
  declare upvotes: number

  @column()
  declare downvotes: number

  @column()
  declare isDeleted: boolean

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column()
  declare deletedBy: string | null

  @column()
  declare frozenUpvotes: number | null

  @column()
  declare frozenDownvotes: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare author: BelongsTo<typeof User>

  @belongsTo(() => Post, { foreignKey: 'postId' })
  declare post: BelongsTo<typeof Post>
}