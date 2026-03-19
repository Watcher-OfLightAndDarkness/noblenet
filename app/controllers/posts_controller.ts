// app/controllers/posts_controller.ts
import Post from '#models/post'
import Vote from '#models/vote'
import Group from '#models/group'
import GroupMembership from '#models/group_membership'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs/promises'
import path from 'node:path'

const rankLimits: Record<string, number> = {
  'Citizen': 500,
  'Baron': 1000,
  'Viscount': 2000,
  'Count': 5000,
  'Marquess': 10000,
  'Duke': 20000,
  'King': 50000,
  'Emperor': Infinity
}

const pinCosts: Record<string, number> = {
  'Baron': 100,
  'Viscount': 200,
  'Count': 300,
  'Marquess': 400,
  'Duke': 500,
  'King': 1000,
  'Emperor': 0
}

export default class PostsController {

  // Show all posts (global + all fiefs) with group info for clickable links
  async index({ response }: HttpContext) {
    try {
      const posts = await Post.query()
        .where('isDeleted', false)
        .preload('author')
        .preload('group')  // Load group info for clickable links
        .orderBy('isPinned', 'desc')
        .orderBy('createdAt', 'desc')
        .limit(50)

      return response.ok({ posts })
    } catch (error) {
      console.error('Fetch posts error:', error)
      return response.internalServerError({ error: 'Failed to fetch posts' })
    }
  }

  async show({ params, auth, response }: HttpContext) {
    try {
      const post = await Post.query()
        .where('id', params.id)
        .where('isDeleted', false)
        .preload('author')
        .preload('group')
        .preload('comments', (query) => {
          query.where('isDeleted', false)
            .preload('author')
            .orderBy('createdAt', 'asc')
        })
        .first()

      if (!post) {
        return response.notFound({ error: 'Post not found' })
      }

      // Parse mediaUrls from JSON string to array
      let mediaUrls: string[] = []
      if (post.mediaUrls) {
        try {
          mediaUrls = JSON.parse(post.mediaUrls)
        } catch (e) {
          mediaUrls = []
        }
      }

      // Get user's vote if authenticated
      let userVote = null
      if (auth.user) {
        const vote = await Vote.query()
          .where('userId', auth.user.id)
          .where('targetType', 'post')
          .where('targetId', post.id)
          .first()
        userVote = vote?.voteType || null
      }

      // Format comments with nested replies
      const commentsWithReplies = await this.formatComments(post.comments)

      // Build response manually to ensure mediaUrls is correct
      const serializedPost = post.serialize()
      serializedPost.mediaUrls = mediaUrls  // Override with parsed array

      return response.ok({
        post: {
          ...serializedPost,
          author: post.author,
          group: post.group,
          comments: commentsWithReplies,
          userVote
        }
      })
    } catch (error) {
      return response.internalServerError({ error: 'Failed to fetch post' })
    }
  }

  // app/controllers/posts_controller.ts
// ... (keep all imports and code the same until the store method)

  async store({ request, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const allowedRanks = ['Baron', 'Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor']
      if (!allowedRanks.includes(user.rank)) {
        return response.forbidden({ error: 'Only Barons and above may issue decrees' })
      }

      const title = request.input('title')
      const content = request.input('content')
      const groupId = request.input('groupId') || null
      const isPinned = request.input('isPinned') === 'true'

      if (groupId && groupId !== 'global') {
        const group = await Group.find(groupId)
        if (!group || group.isDeleted) {
          return response.badRequest({ error: 'Fief not found' })
        }
      }

      const maxChars = rankLimits[user.rank] || 500
      if (content.length > maxChars) {
        return response.badRequest({
          error: `Content exceeds ${maxChars} character limit for ${user.rank}`
        })
      }

      if (isPinned) {
        const pinCost = pinCosts[user.rank]
        if (user.totalPoints < pinCost) {
          return response.badRequest({
            error: `Insufficient points. Pinning costs ${pinCost} points`
          })
        }
        user.totalPoints -= pinCost
        await user.save()
      }

      const mediaFiles = request.files('media', {
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'gif']
      })

      const mediaUrls: string[] = []

      const canUploadMedia = ['Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor'].includes(user.rank)

      if (canUploadMedia && mediaFiles.length > 0) {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'posts')
        await fs.mkdir(uploadsDir, { recursive: true })

        for (const file of mediaFiles) {
          if (!file.isValid) continue

          const fileName = `${user.id}_${Date.now()}_${file.clientName}`
          await file.move(uploadsDir, { name: fileName })
          mediaUrls.push(`/uploads/posts/${fileName}`)
        }
      }

      const post = await Post.create({
        userId: user.id,
        groupId: groupId === 'global' ? null : groupId,
        title,
        content,
        isTextOnly: mediaUrls.length === 0,
        mediaUrls: mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
        isPinned,
        pinExpiresAt: isPinned ? null : null,
        upvotes: 0,
        downvotes: 0
      })

      await post.load('author')
      await post.load('group')

      // DEBUG: Log what we have
      console.log('Post ID:', post.id)
      console.log('Post object:', post)
      console.log('Serialized post:', post.serialize())

      // FIX: Build response manually without relying on serialize()
      return response.created({
        post: {
          id: post.id,
          userId: post.userId,
          groupId: post.groupId,
          title: post.title,
          content: post.content,
          isTextOnly: post.isTextOnly,
          mediaUrls: mediaUrls,
          isPinned: post.isPinned,
          upvotes: post.upvotes,
          downvotes: post.downvotes,
          isDeleted: post.isDeleted,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          author: post.author,
          group: post.group
        }
      })
    } catch (error: any) {
      console.error('Post creation error:', error)
      return response.internalServerError({
        error: 'Failed to create post',
        details: error.message
      })
    }
  }



  private async formatComments(comments: any[], parentId: string | null = null): Promise<any[]> {
    const result = []

    for (const comment of comments) {
      if (comment.parentCommentId === parentId) {
        const replies = await this.formatComments(comments, comment.id)
        result.push({
          ...comment.serialize(),
          author: comment.author,
          replies
        })
      }
    }

    return result
  }
}
