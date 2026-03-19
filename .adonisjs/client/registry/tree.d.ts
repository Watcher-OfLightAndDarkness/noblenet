/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    register: typeof routes['auth.register']
    login: typeof routes['auth.login']
    logout: typeof routes['auth.logout']
    me: typeof routes['auth.me']
    updateRank: typeof routes['auth.update_rank']
    upgradeRank: typeof routes['auth.upgrade_rank']
    claimStipend: typeof routes['auth.claim_stipend']
    updateProfile: typeof routes['auth.update_profile']
    uploadImage: typeof routes['auth.upload_image']
  }
  posts: {
    index: typeof routes['posts.index']
    store: typeof routes['posts.store']
    show: typeof routes['posts.show']
  }
  comments: {
    store: typeof routes['comments.store']
  }
  votes: {
    store: typeof routes['votes.store']
  }
  groups: {
    index: typeof routes['groups.index']
    store: typeof routes['groups.store']
    myGroups: typeof routes['groups.my_groups']
    getPosts: typeof routes['groups.get_posts']
    getMessages: typeof routes['groups.get_messages']
    storeMessage: typeof routes['groups.store_message']
    join: typeof routes['groups.join']
    leave: typeof routes['groups.leave']
    invite: typeof routes['groups.invite']
    show: typeof routes['groups.show']
  }
  ai: {
    ask: typeof routes['ai.ask']
  }
  executions: {
    store: typeof routes['executions.store']
    index: typeof routes['executions.index']
    searchUsers: typeof routes['executions.search_users']
    recent: typeof routes['executions.recent']
    checkStatus: typeof routes['executions.check_status']
  }
  admin: {
    searchUsers: typeof routes['admin.search_users']
    getUser: typeof routes['admin.get_user']
    grantPoints: typeof routes['admin.grant_points']
    makeEmperor: typeof routes['admin.make_emperor']
    setRank: typeof routes['admin.set_rank']
  }
}
