// app/controllers/groups_controller.ts
import Group from '#models/group'
import GroupMembership from '#models/group_membership'
import GroupMessage from '#models/group_message'
import type { HttpContext } from '@adonisjs/core/http'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class GroupsController {
  async index({ response }: HttpContext) {
    try {
      const groups = await Group.query()
        .where('isDeleted', false)
        .where('visibility', 'public')
        .preload('owner')
        .orderBy('memberCount', 'desc')

      return response.ok({ groups })
    } catch (error) {
      return response.internalServerError({ error: 'Failed to fetch groups' })
    }
  }

  async myGroups({ auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const memberships = await GroupMembership.query()
        .where('userId', user.id)
        .preload('group', (query: ModelQueryBuilderContract<typeof Group>) => {
          query.preload('owner')
        })

      const groups = memberships.map((m: GroupMembership) => ({
        id: m.group.id,
        name: m.group.name,
        memberCount: m.group.memberCount,
        postsCount: 0,
        role: m.role,
        visibility: m.group.visibility
      }))

      return response.ok({ groups })
    } catch (error: any) {
      return response.internalServerError({
        error: 'Failed to fetch your groups',
        details: error.message
      })
    }
  }

  async show({ params, auth, response }: HttpContext) {
    try {
      const group = await Group.query()
        .where('id', params.id)
        .where('isDeleted', false)
        .preload('owner')
        .first()

      if (!group) {
        return response.notFound({ error: 'Group not found' })
      }

      let isMember = false
      let role = null

      if (auth.user) {
        const membership = await GroupMembership.query()
          .where('groupId', group.id)
          .where('userId', auth.user.id)
          .first()
        isMember = !!membership
        role = membership?.role || null
      }

      if (group.visibility === 'private' && !isMember) {
        return response.forbidden({ error: 'This is a private fief. Invitation required.' })
      }

      const postModule = await import('#models/post')
      const Post = postModule.default
      const countQuery = await Post.query()
        .where('groupId', group.id)
        .where('isDeleted', false)
        .count('* as total')
      const postsCount = countQuery[0].$extras.total

      return response.ok({
        group: {
          ...group.serialize(),
          owner: group.owner,
          isMember,
          role,
          postsCount
        }
      })
    } catch (error: any) {
      return response.internalServerError({ error: 'Failed to fetch group' })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const allowedRanks = ['Count', 'Marquess', 'Duke', 'King', 'Emperor']
      if (!allowedRanks.includes(user.rank)) {
        return response.forbidden({ error: 'Only Counts and above may create fiefs' })
      }

      const { name, description, visibility } = request.only(['name', 'description', 'visibility'])

      if (!name || name.length < 3 || name.length > 64) {
        return response.badRequest({ error: 'Name must be 3-64 characters' })
      }

      const existing = await Group.findBy('name', name)
      if (existing) {
        return response.badRequest({ error: 'A fief with this name already exists' })
      }

      const group = await Group.create({
        name,
        description: description || null,
        ownerId: user.id,
        visibility: visibility || 'public',
        memberCount: 1
      })

      await GroupMembership.create({
        groupId: group.id,
        userId: user.id,
        role: 'heir_designate'
      })

      await group.load('owner')

      return response.created({ group })
    } catch (error: any) {
      console.error('Group creation error:', error)
      return response.internalServerError({
        error: 'Failed to create group',
        details: error.message
      })
    }
  }

  async join({ params, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const group = await Group.find(params.id)
      if (!group || group.isDeleted) {
        return response.notFound({ error: 'Fief not found' })
      }

      if (group.visibility === 'private') {
        return response.forbidden({ error: 'Private fiefs require invitation' })
      }

      const existing = await GroupMembership.query()
        .where('groupId', group.id)
        .where('userId', user.id)
        .first()

      if (existing) {
        return response.badRequest({ error: 'Already a member of this fief' })
      }

      await GroupMembership.create({
        groupId: group.id,
        userId: user.id,
        role: 'member'
      })

      group.memberCount++
      await group.save()

      return response.ok({ message: 'Joined fief successfully' })
    } catch (error: any) {
      return response.internalServerError({
        error: 'Failed to join fief',
        details: error.message
      })
    }
  }

  async leave({ params, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const group = await Group.find(params.id)
      if (!group || group.isDeleted) {
        return response.notFound({ error: 'Fief not found' })
      }

      if (group.ownerId === user.id) {
        return response.badRequest({
          error: 'As fief owner, you cannot leave. Transfer ownership or dissolve the fief.'
        })
      }

      const membership = await GroupMembership.query()
        .where('groupId', group.id)
        .where('userId', user.id)
        .first()

      if (!membership) {
        return response.badRequest({ error: 'Not a member of this fief' })
      }

      await membership.delete()

      group.memberCount = Math.max(0, group.memberCount - 1)
      await group.save()

      return response.ok({ message: 'Left fief successfully' })
    } catch (error: any) {
      return response.internalServerError({
        error: 'Failed to leave fief',
        details: error.message
      })
    }
  }

  async invite({ params, request, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const group = await Group.find(params.id)
      if (!group || group.isDeleted) {
        return response.notFound({ error: 'Fief not found' })
      }

      const membership = await GroupMembership.query()
        .where('groupId', group.id)
        .where('userId', user.id)
        .first()

      if (!membership) {
        return response.forbidden({ error: 'Only members may invite others' })
      }

      const { userId } = request.only(['userId'])

      const UserModule = (await import('#models/user'))
      const User = UserModule.default
      const userQuery = await User.find(userId)
      if (!userQuery) {
        return response.notFound({ error: 'User not found' })
      }

      const existing = await GroupMembership.query()
        .where('groupId', group.id)
        .where('userId', userId)
        .first()

      if (existing) {
        return response.badRequest({ error: 'User is already a member' })
      }

      await GroupMembership.create({
        groupId: group.id,
        userId: userId,
        role: 'member'
      })

      group.memberCount++
      await group.save()

      return response.ok({ message: 'User invited successfully' })
    } catch (error: any) {
      return response.internalServerError({
        error: 'Failed to invite user',
        details: error.message
      })
    }
  }

  async getPosts({ params, response }: HttpContext) {
    try {
      const Post1Module = (await import('#models/post'))
      const Post1 = Post1Module.default
      const postsQuery = await Post1.query()
        .where('groupId', params.id)
        .where('isDeleted', false)
        .preload('author')
        .orderBy('isPinned', 'desc')
        .orderBy('createdAt', 'desc')

      return response.ok({ posts: postsQuery })
    } catch (error: any) {
      return response.internalServerError({
        error: 'Failed to fetch fief posts',
        details: error.message
      })
    }
  }

  async getMessages({ params, request, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const membership = await GroupMembership.query()
        .where('groupId', params.id)
        .where('userId', user.id)
        .first()

      if (!membership) {
        return response.forbidden({ error: 'You are not a member of this fief' })
      }

      const after = request.input('after')

      let query = GroupMessage.query()
        .where('groupId', params.id)
        .preload('author')
        .orderBy('createdAt', 'asc')
        .limit(50)

      if (after) {
        query = query.where('id', '>', after)
      }

      const messages = await query

      return response.ok({ messages })
    } catch (error: any) {
      return response.internalServerError({
        error: 'Failed to fetch messages',
        details: error.message
      })
    }
  }

  async storeMessage({ params, request, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const membership = await GroupMembership.query()
        .where('groupId', params.id)
        .where('userId', user.id)
        .first()

      if (!membership) {
        return response.forbidden({ error: 'You are not a member of this fief' })
      }

      const { content } = request.only(['content'])

      if (!content || content.trim().length === 0) {
        return response.badRequest({ error: 'Message cannot be empty' })
      }

      if (content.length > 1000) {
        return response.badRequest({ error: 'Message too long (max 1000 chars)' })
      }

      const message = await GroupMessage.create({
        groupId: params.id,
        userId: user.id,
        content: content.trim()
      })

      await message.load('author')

      return response.created({ message })
    } catch (error: any) {
      return response.internalServerError({
        error: 'Failed to send message',
        details: error.message
      })
    }
  }
}
