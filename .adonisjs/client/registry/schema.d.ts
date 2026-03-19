/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.register': {
    methods: ["POST"]
    pattern: '/api/register'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['register']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['register']>>>
    }
  }
  'auth.login': {
    methods: ["POST"]
    pattern: '/api/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>>
    }
  }
  'auth.logout': {
    methods: ["POST"]
    pattern: '/api/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
    }
  }
  'auth.me': {
    methods: ["GET","HEAD"]
    pattern: '/api/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['me']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['me']>>>
    }
  }
  'auth.update_rank': {
    methods: ["POST"]
    pattern: '/api/me/rank'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['updateRank']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['updateRank']>>>
    }
  }
  'auth.upgrade_rank': {
    methods: ["POST"]
    pattern: '/api/me/upgrade'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['upgradeRank']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['upgradeRank']>>>
    }
  }
  'auth.claim_stipend': {
    methods: ["POST"]
    pattern: '/api/me/stipend'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['claimStipend']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['claimStipend']>>>
    }
  }
  'auth.update_profile': {
    methods: ["PATCH"]
    pattern: '/api/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['updateProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['updateProfile']>>>
    }
  }
  'auth.upload_image': {
    methods: ["POST"]
    pattern: '/api/profile/image'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['uploadImage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['uploadImage']>>>
    }
  }
  'posts.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/posts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/posts_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/posts_controller').default['index']>>>
    }
  }
  'posts.store': {
    methods: ["POST"]
    pattern: '/api/posts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/posts_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/posts_controller').default['store']>>>
    }
  }
  'posts.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/posts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/posts_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/posts_controller').default['show']>>>
    }
  }
  'comments.store': {
    methods: ["POST"]
    pattern: '/api/posts/:postId/comments'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { postId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/comments_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/comments_controller').default['store']>>>
    }
  }
  'votes.store': {
    methods: ["POST"]
    pattern: '/api/vote'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/votes_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/votes_controller').default['store']>>>
    }
  }
  'groups.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/groups'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['index']>>>
    }
  }
  'groups.store': {
    methods: ["POST"]
    pattern: '/api/groups'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['store']>>>
    }
  }
  'groups.my_groups': {
    methods: ["GET","HEAD"]
    pattern: '/api/my-groups'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['myGroups']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['myGroups']>>>
    }
  }
  'groups.get_posts': {
    methods: ["GET","HEAD"]
    pattern: '/api/groups/:id/posts'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['getPosts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['getPosts']>>>
    }
  }
  'groups.get_messages': {
    methods: ["GET","HEAD"]
    pattern: '/api/groups/:id/messages'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['getMessages']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['getMessages']>>>
    }
  }
  'groups.store_message': {
    methods: ["POST"]
    pattern: '/api/groups/:id/messages'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['storeMessage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['storeMessage']>>>
    }
  }
  'groups.join': {
    methods: ["POST"]
    pattern: '/api/groups/:id/join'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['join']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['join']>>>
    }
  }
  'groups.leave': {
    methods: ["POST"]
    pattern: '/api/groups/:id/leave'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['leave']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['leave']>>>
    }
  }
  'groups.invite': {
    methods: ["POST"]
    pattern: '/api/groups/:id/invite'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['invite']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['invite']>>>
    }
  }
  'groups.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/groups/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['show']>>>
    }
  }
  'ai.ask': {
    methods: ["POST"]
    pattern: '/api/ask-ai'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/ai_controller').default['ask']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/ai_controller').default['ask']>>>
    }
  }
  'executions.store': {
    methods: ["POST"]
    pattern: '/api/executions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/executions_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/executions_controller').default['store']>>>
    }
  }
  'executions.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/executions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/executions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/executions_controller').default['index']>>>
    }
  }
  'executions.search_users': {
    methods: ["GET","HEAD"]
    pattern: '/api/executions/search-users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/executions_controller').default['searchUsers']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/executions_controller').default['searchUsers']>>>
    }
  }
  'executions.recent': {
    methods: ["GET","HEAD"]
    pattern: '/api/executions/recent'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/executions_controller').default['recent']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/executions_controller').default['recent']>>>
    }
  }
  'executions.check_status': {
    methods: ["GET","HEAD"]
    pattern: '/api/me/execution-status'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/executions_controller').default['checkStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/executions_controller').default['checkStatus']>>>
    }
  }
  'admin.search_users': {
    methods: ["GET","HEAD"]
    pattern: '/api/users/search'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['searchUsers']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['searchUsers']>>>
    }
  }
  'admin.get_user': {
    methods: ["GET","HEAD"]
    pattern: '/api/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['getUser']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['getUser']>>>
    }
  }
  'admin.grant_points': {
    methods: ["POST"]
    pattern: '/api/admin/grant-points'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['grantPoints']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['grantPoints']>>>
    }
  }
  'admin.make_emperor': {
    methods: ["POST"]
    pattern: '/api/admin/make-emperor'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['makeEmperor']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['makeEmperor']>>>
    }
  }
  'admin.set_rank': {
    methods: ["POST"]
    pattern: '/api/admin/set-rank'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['setRank']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['setRank']>>>
    }
  }
}
