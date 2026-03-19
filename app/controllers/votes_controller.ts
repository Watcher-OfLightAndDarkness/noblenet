// app/controllers/votes_controller.ts
import Vote from '#models/vote'
import Post from '#models/post'
import Comment from '#models/comment'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

const POINTS_PER_UPVOTE = 10
const POINTS_PER_DOWNVOTE = -5

export default class VotesController {
  async store({ request, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const { targetId, targetType, voteType } = request.only(['targetId', 'targetType', 'voteType'])

      if (!['up', 'down'].includes(voteType)) {
        return response.badRequest({ error: 'Invalid vote type' })
      }

      if (!['post', 'comment'].includes(targetType)) {
        return response.badRequest({ error: 'Invalid target type' })
      }

      // Find target
      let target
      let author: User | null = null

      if (targetType === 'post') {
        target = await Post.find(targetId)
        if (target) {
          author = await User.find(target.userId)
        }
      } else {
        target = await Comment.find(targetId)
        if (target) {
          author = await User.find(target.userId)
        }
      }

      if (!target || target.isDeleted) {
        return response.notFound({ error: 'Target not found' })
      }

      // Prevent self-voting
      if (author && author.id === user.id) {
        return response.badRequest({ error: 'Cannot vote on your own content' })
      }

      // Check existing vote
      const existingVote = await Vote.query()
        .where('userId', user.id)
        .where('targetType', targetType)
        .where('targetId', targetId)
        .first()

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Remove vote (toggle off)
          await existingVote.delete()

          // Update target counts
          if (voteType === 'up') {
            target.upvotes--
            if (author) {
              author.upvotesReceived = Math.max(0, author.upvotesReceived - 1)
              author.lifetimeEarned = Math.max(0, author.lifetimeEarned - POINTS_PER_UPVOTE)
              author.totalPoints = Math.max(0, author.totalPoints - POINTS_PER_UPVOTE)
            }
          } else {
            target.downvotes--
            if (author) {
              author.downvotesReceived = Math.max(0, author.downvotesReceived - 1)
              author.lifetimeEarned -= POINTS_PER_DOWNVOTE // Subtract negative = add back
              author.totalPoints -= POINTS_PER_DOWNVOTE
            }
          }

          await target.save()
          if (author) await author.save()

          return response.ok({ message: 'Vote removed' })
        } else {
          // Change vote
          const oldType = existingVote.voteType
          existingVote.voteType = voteType
          await existingVote.save()

          // Update counts
          if (oldType === 'up') {
            target.upvotes--
            target.downvotes++
            if (author) {
              author.upvotesReceived = Math.max(0, author.upvotesReceived - 1)
              author.downvotesReceived++
              author.lifetimeEarned = Math.max(0, author.lifetimeEarned - POINTS_PER_UPVOTE)
              author.totalPoints = Math.max(0, author.totalPoints - POINTS_PER_UPVOTE)
              author.lifetimeEarned += POINTS_PER_DOWNVOTE
              author.totalPoints += POINTS_PER_DOWNVOTE
            }
          } else {
            target.downvotes--
            target.upvotes++
            if (author) {
              author.downvotesReceived = Math.max(0, author.downvotesReceived - 1)
              author.upvotesReceived++
              author.lifetimeEarned -= POINTS_PER_DOWNVOTE
              author.totalPoints -= POINTS_PER_DOWNVOTE
              author.lifetimeEarned += POINTS_PER_UPVOTE
              author.totalPoints += POINTS_PER_UPVOTE
            }
          }

          await target.save()
          if (author) await author.save()

          return response.ok({ message: 'Vote changed' })
        }
      }

      // Create new vote
      await Vote.create({
        userId: user.id,
        targetType,
        targetId,
        voteType,
        pointsTransferred: voteType === 'up' ? POINTS_PER_UPVOTE : POINTS_PER_DOWNVOTE
      })

      // Update target counts and author points + vote counts
      if (voteType === 'up') {
        target.upvotes++
        if (author) {
          author.upvotesReceived++
          author.lifetimeEarned += POINTS_PER_UPVOTE
          author.totalPoints += POINTS_PER_UPVOTE
        }
      } else {
        target.downvotes++
        if (author) {
          author.downvotesReceived++
          author.lifetimeEarned += POINTS_PER_DOWNVOTE
          author.totalPoints += POINTS_PER_DOWNVOTE
        }
      }

      await target.save()
      if (author) await author.save()

      return response.created({ message: 'Vote recorded' })
    } catch (error: any) {
      console.error('Vote error:', error)
      return response.internalServerError({
        error: 'Failed to record vote',
        details: error.message
      })
    }
  }
}
