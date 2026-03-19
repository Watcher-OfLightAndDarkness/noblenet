// app/controllers/comments_controller.ts
import Comment from '#models/comment'
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class CommentsController {
  async store({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    
    try {
      const post = await Post.find(params.postId)
      if (!post || post.isDeleted) {
        return response.notFound({ error: 'Post not found' })
      }

      const content = request.input('content')
      const parentCommentId = request.input('parentCommentId')

      if (!content || content.trim().length === 0) {
        return response.badRequest({ error: 'Comment cannot be empty' })
      }

      if (content.length > 2000) {
        return response.badRequest({ error: 'Comment too long (max 2000 chars)' })
      }

      // Check if parent comment exists
      if (parentCommentId) {
        const parentComment = await Comment.find(parentCommentId)
        if (!parentComment || parentComment.postId !== post.id) {
          return response.badRequest({ error: 'Invalid parent comment' })
        }
      }

      const comment = await Comment.create({
        postId: post.id,
        userId: user.id,
        parentCommentId,
        content: content.trim(),
        upvotes: 0,
        downvotes: 0
      })

      await comment.load('author')

      return response.created({ comment })
    } catch (error: any) {
      console.error('Comment creation error:', error)
      return response.internalServerError({ 
        error: 'Failed to post comment',
        details: error.message 
      })
    }
  }
}