// app/helpers/groupHelpers.ts
import Group from '../models/group.js'
import GroupMembership from '../models/group_membership.js'

/**
 * Assign a user as heir_designate to a group
 * @param groupName The name of the group
 * @param userId The user ID to assign
 */
export async function assignHeirToGroup(groupName: string, userId: string) {
  // find the group
  const group = await Group.query().where('name', groupName).first()
  if (!group) {
    throw new Error(`Group "${groupName}" not found`)
  }

  // check if user is already a member
  const existing = await GroupMembership.query()
    .where('groupId', group.id)
    .andWhere('userId', userId)
    .first()

  if (existing) {
    // update role if needed
    if (existing.role !== 'heir_designate') {
      existing.role = 'heir_designate'
      await existing.save()
    }
    return existing
  }

  // create new membership
  const membership = await GroupMembership.create({
    groupId: group.id,
    userId,
    role: 'heir_designate',
  })

  return membership
}