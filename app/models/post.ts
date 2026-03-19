// app/models/post.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, computed, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import User from './user.js'
import Group from './group.js'
import Comment from './comment.js'

export default class Post extends BaseModel {
  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'user_id' })
  declare userId: string

  @column({ columnName: 'group_id' })
  declare groupId: string | null

  @column()
  declare title: string

  @column()
  declare content: string

  @column({ columnName: 'is_text_only' })
  declare isTextOnly: boolean

  @column({ columnName: 'media_urls' })
  declare mediaUrls: string | null

  @column()
  declare upvotes: number

  @column()
  declare downvotes: number

  @column({ columnName: 'is_deleted' })
  declare isDeleted: boolean

  @column.dateTime({ columnName: 'deleted_at' })
  declare deletedAt: DateTime | null

  @column({ columnName: 'deleted_by' })
  declare deletedBy: string | null

  @column({ columnName: 'frozen_upvotes' })
  declare frozenUpvotes: number | null

  @column({ columnName: 'frozen_downvotes' })
  declare frozenDownvotes: number | null

  @column({ columnName: 'is_pinned' })
  declare isPinned: boolean

  @column.dateTime({ columnName: 'pin_expires_at' })
  declare pinExpiresAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare author: BelongsTo<typeof User>

  @belongsTo(() => Group, { foreignKey: 'groupId' })
  declare group: BelongsTo<typeof Group>

  @hasMany(() => Comment, { foreignKey: 'postId' })
  declare comments: HasMany<typeof Comment>

  @beforeCreate()
    static async generateId(post: Post) {
      post.id = uuidv4()
    }
  @computed()
  get mediaUrlsArray(): string[] {
    if (!this.mediaUrls) return []
    try {
      return JSON.parse(this.mediaUrls)
    } catch (e) {
      return []
    }
  }
}
