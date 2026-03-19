/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.register': {
    methods: ["POST"],
    pattern: '/api/register',
    tokens: [{"old":"/api/register","type":0,"val":"api","end":""},{"old":"/api/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register']['types'],
  },
  'auth.login': {
    methods: ["POST"],
    pattern: '/api/login',
    tokens: [{"old":"/api/login","type":0,"val":"api","end":""},{"old":"/api/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.logout': {
    methods: ["POST"],
    pattern: '/api/logout',
    tokens: [{"old":"/api/logout","type":0,"val":"api","end":""},{"old":"/api/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'auth.me': {
    methods: ["GET","HEAD"],
    pattern: '/api/me',
    tokens: [{"old":"/api/me","type":0,"val":"api","end":""},{"old":"/api/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['auth.me']['types'],
  },
  'auth.update_rank': {
    methods: ["POST"],
    pattern: '/api/me/rank',
    tokens: [{"old":"/api/me/rank","type":0,"val":"api","end":""},{"old":"/api/me/rank","type":0,"val":"me","end":""},{"old":"/api/me/rank","type":0,"val":"rank","end":""}],
    types: placeholder as Registry['auth.update_rank']['types'],
  },
  'auth.upgrade_rank': {
    methods: ["POST"],
    pattern: '/api/me/upgrade',
    tokens: [{"old":"/api/me/upgrade","type":0,"val":"api","end":""},{"old":"/api/me/upgrade","type":0,"val":"me","end":""},{"old":"/api/me/upgrade","type":0,"val":"upgrade","end":""}],
    types: placeholder as Registry['auth.upgrade_rank']['types'],
  },
  'auth.claim_stipend': {
    methods: ["POST"],
    pattern: '/api/me/stipend',
    tokens: [{"old":"/api/me/stipend","type":0,"val":"api","end":""},{"old":"/api/me/stipend","type":0,"val":"me","end":""},{"old":"/api/me/stipend","type":0,"val":"stipend","end":""}],
    types: placeholder as Registry['auth.claim_stipend']['types'],
  },
  'auth.update_profile': {
    methods: ["PATCH"],
    pattern: '/api/me',
    tokens: [{"old":"/api/me","type":0,"val":"api","end":""},{"old":"/api/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['auth.update_profile']['types'],
  },
  'auth.upload_image': {
    methods: ["POST"],
    pattern: '/api/profile/image',
    tokens: [{"old":"/api/profile/image","type":0,"val":"api","end":""},{"old":"/api/profile/image","type":0,"val":"profile","end":""},{"old":"/api/profile/image","type":0,"val":"image","end":""}],
    types: placeholder as Registry['auth.upload_image']['types'],
  },
  'posts.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/posts',
    tokens: [{"old":"/api/posts","type":0,"val":"api","end":""},{"old":"/api/posts","type":0,"val":"posts","end":""}],
    types: placeholder as Registry['posts.index']['types'],
  },
  'posts.store': {
    methods: ["POST"],
    pattern: '/api/posts',
    tokens: [{"old":"/api/posts","type":0,"val":"api","end":""},{"old":"/api/posts","type":0,"val":"posts","end":""}],
    types: placeholder as Registry['posts.store']['types'],
  },
  'posts.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/posts/:id',
    tokens: [{"old":"/api/posts/:id","type":0,"val":"api","end":""},{"old":"/api/posts/:id","type":0,"val":"posts","end":""},{"old":"/api/posts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['posts.show']['types'],
  },
  'comments.store': {
    methods: ["POST"],
    pattern: '/api/posts/:postId/comments',
    tokens: [{"old":"/api/posts/:postId/comments","type":0,"val":"api","end":""},{"old":"/api/posts/:postId/comments","type":0,"val":"posts","end":""},{"old":"/api/posts/:postId/comments","type":1,"val":"postId","end":""},{"old":"/api/posts/:postId/comments","type":0,"val":"comments","end":""}],
    types: placeholder as Registry['comments.store']['types'],
  },
  'votes.store': {
    methods: ["POST"],
    pattern: '/api/vote',
    tokens: [{"old":"/api/vote","type":0,"val":"api","end":""},{"old":"/api/vote","type":0,"val":"vote","end":""}],
    types: placeholder as Registry['votes.store']['types'],
  },
  'groups.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/groups',
    tokens: [{"old":"/api/groups","type":0,"val":"api","end":""},{"old":"/api/groups","type":0,"val":"groups","end":""}],
    types: placeholder as Registry['groups.index']['types'],
  },
  'groups.store': {
    methods: ["POST"],
    pattern: '/api/groups',
    tokens: [{"old":"/api/groups","type":0,"val":"api","end":""},{"old":"/api/groups","type":0,"val":"groups","end":""}],
    types: placeholder as Registry['groups.store']['types'],
  },
  'groups.my_groups': {
    methods: ["GET","HEAD"],
    pattern: '/api/my-groups',
    tokens: [{"old":"/api/my-groups","type":0,"val":"api","end":""},{"old":"/api/my-groups","type":0,"val":"my-groups","end":""}],
    types: placeholder as Registry['groups.my_groups']['types'],
  },
  'groups.get_posts': {
    methods: ["GET","HEAD"],
    pattern: '/api/groups/:id/posts',
    tokens: [{"old":"/api/groups/:id/posts","type":0,"val":"api","end":""},{"old":"/api/groups/:id/posts","type":0,"val":"groups","end":""},{"old":"/api/groups/:id/posts","type":1,"val":"id","end":""},{"old":"/api/groups/:id/posts","type":0,"val":"posts","end":""}],
    types: placeholder as Registry['groups.get_posts']['types'],
  },
  'groups.get_messages': {
    methods: ["GET","HEAD"],
    pattern: '/api/groups/:id/messages',
    tokens: [{"old":"/api/groups/:id/messages","type":0,"val":"api","end":""},{"old":"/api/groups/:id/messages","type":0,"val":"groups","end":""},{"old":"/api/groups/:id/messages","type":1,"val":"id","end":""},{"old":"/api/groups/:id/messages","type":0,"val":"messages","end":""}],
    types: placeholder as Registry['groups.get_messages']['types'],
  },
  'groups.store_message': {
    methods: ["POST"],
    pattern: '/api/groups/:id/messages',
    tokens: [{"old":"/api/groups/:id/messages","type":0,"val":"api","end":""},{"old":"/api/groups/:id/messages","type":0,"val":"groups","end":""},{"old":"/api/groups/:id/messages","type":1,"val":"id","end":""},{"old":"/api/groups/:id/messages","type":0,"val":"messages","end":""}],
    types: placeholder as Registry['groups.store_message']['types'],
  },
  'groups.join': {
    methods: ["POST"],
    pattern: '/api/groups/:id/join',
    tokens: [{"old":"/api/groups/:id/join","type":0,"val":"api","end":""},{"old":"/api/groups/:id/join","type":0,"val":"groups","end":""},{"old":"/api/groups/:id/join","type":1,"val":"id","end":""},{"old":"/api/groups/:id/join","type":0,"val":"join","end":""}],
    types: placeholder as Registry['groups.join']['types'],
  },
  'groups.leave': {
    methods: ["POST"],
    pattern: '/api/groups/:id/leave',
    tokens: [{"old":"/api/groups/:id/leave","type":0,"val":"api","end":""},{"old":"/api/groups/:id/leave","type":0,"val":"groups","end":""},{"old":"/api/groups/:id/leave","type":1,"val":"id","end":""},{"old":"/api/groups/:id/leave","type":0,"val":"leave","end":""}],
    types: placeholder as Registry['groups.leave']['types'],
  },
  'groups.invite': {
    methods: ["POST"],
    pattern: '/api/groups/:id/invite',
    tokens: [{"old":"/api/groups/:id/invite","type":0,"val":"api","end":""},{"old":"/api/groups/:id/invite","type":0,"val":"groups","end":""},{"old":"/api/groups/:id/invite","type":1,"val":"id","end":""},{"old":"/api/groups/:id/invite","type":0,"val":"invite","end":""}],
    types: placeholder as Registry['groups.invite']['types'],
  },
  'groups.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/groups/:id',
    tokens: [{"old":"/api/groups/:id","type":0,"val":"api","end":""},{"old":"/api/groups/:id","type":0,"val":"groups","end":""},{"old":"/api/groups/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['groups.show']['types'],
  },
  'ai.ask': {
    methods: ["POST"],
    pattern: '/api/ask-ai',
    tokens: [{"old":"/api/ask-ai","type":0,"val":"api","end":""},{"old":"/api/ask-ai","type":0,"val":"ask-ai","end":""}],
    types: placeholder as Registry['ai.ask']['types'],
  },
  'executions.store': {
    methods: ["POST"],
    pattern: '/api/executions',
    tokens: [{"old":"/api/executions","type":0,"val":"api","end":""},{"old":"/api/executions","type":0,"val":"executions","end":""}],
    types: placeholder as Registry['executions.store']['types'],
  },
  'executions.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/executions',
    tokens: [{"old":"/api/executions","type":0,"val":"api","end":""},{"old":"/api/executions","type":0,"val":"executions","end":""}],
    types: placeholder as Registry['executions.index']['types'],
  },
  'executions.search_users': {
    methods: ["GET","HEAD"],
    pattern: '/api/executions/search-users',
    tokens: [{"old":"/api/executions/search-users","type":0,"val":"api","end":""},{"old":"/api/executions/search-users","type":0,"val":"executions","end":""},{"old":"/api/executions/search-users","type":0,"val":"search-users","end":""}],
    types: placeholder as Registry['executions.search_users']['types'],
  },
  'executions.recent': {
    methods: ["GET","HEAD"],
    pattern: '/api/executions/recent',
    tokens: [{"old":"/api/executions/recent","type":0,"val":"api","end":""},{"old":"/api/executions/recent","type":0,"val":"executions","end":""},{"old":"/api/executions/recent","type":0,"val":"recent","end":""}],
    types: placeholder as Registry['executions.recent']['types'],
  },
  'executions.check_status': {
    methods: ["GET","HEAD"],
    pattern: '/api/me/execution-status',
    tokens: [{"old":"/api/me/execution-status","type":0,"val":"api","end":""},{"old":"/api/me/execution-status","type":0,"val":"me","end":""},{"old":"/api/me/execution-status","type":0,"val":"execution-status","end":""}],
    types: placeholder as Registry['executions.check_status']['types'],
  },
  'admin.search_users': {
    methods: ["GET","HEAD"],
    pattern: '/api/users/search',
    tokens: [{"old":"/api/users/search","type":0,"val":"api","end":""},{"old":"/api/users/search","type":0,"val":"users","end":""},{"old":"/api/users/search","type":0,"val":"search","end":""}],
    types: placeholder as Registry['admin.search_users']['types'],
  },
  'admin.get_user': {
    methods: ["GET","HEAD"],
    pattern: '/api/users/:id',
    tokens: [{"old":"/api/users/:id","type":0,"val":"api","end":""},{"old":"/api/users/:id","type":0,"val":"users","end":""},{"old":"/api/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.get_user']['types'],
  },
  'admin.grant_points': {
    methods: ["POST"],
    pattern: '/api/admin/grant-points',
    tokens: [{"old":"/api/admin/grant-points","type":0,"val":"api","end":""},{"old":"/api/admin/grant-points","type":0,"val":"admin","end":""},{"old":"/api/admin/grant-points","type":0,"val":"grant-points","end":""}],
    types: placeholder as Registry['admin.grant_points']['types'],
  },
  'admin.make_emperor': {
    methods: ["POST"],
    pattern: '/api/admin/make-emperor',
    tokens: [{"old":"/api/admin/make-emperor","type":0,"val":"api","end":""},{"old":"/api/admin/make-emperor","type":0,"val":"admin","end":""},{"old":"/api/admin/make-emperor","type":0,"val":"make-emperor","end":""}],
    types: placeholder as Registry['admin.make_emperor']['types'],
  },
  'admin.set_rank': {
    methods: ["POST"],
    pattern: '/api/admin/set-rank',
    tokens: [{"old":"/api/admin/set-rank","type":0,"val":"api","end":""},{"old":"/api/admin/set-rank","type":0,"val":"admin","end":""},{"old":"/api/admin/set-rank","type":0,"val":"set-rank","end":""}],
    types: placeholder as Registry['admin.set_rank']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
