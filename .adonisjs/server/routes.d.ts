import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'auth.update_rank': { paramsTuple?: []; params?: {} }
    'auth.upgrade_rank': { paramsTuple?: []; params?: {} }
    'auth.claim_stipend': { paramsTuple?: []; params?: {} }
    'auth.update_profile': { paramsTuple?: []; params?: {} }
    'auth.upload_image': { paramsTuple?: []; params?: {} }
    'posts.index': { paramsTuple?: []; params?: {} }
    'posts.store': { paramsTuple?: []; params?: {} }
    'posts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'comments.store': { paramsTuple: [ParamValue]; params: {'postId': ParamValue} }
    'votes.store': { paramsTuple?: []; params?: {} }
    'groups.index': { paramsTuple?: []; params?: {} }
    'groups.store': { paramsTuple?: []; params?: {} }
    'groups.my_groups': { paramsTuple?: []; params?: {} }
    'groups.get_posts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.get_messages': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.store_message': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.join': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.leave': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.invite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'ai.ask': { paramsTuple?: []; params?: {} }
    'executions.store': { paramsTuple?: []; params?: {} }
    'executions.index': { paramsTuple?: []; params?: {} }
    'executions.search_users': { paramsTuple?: []; params?: {} }
    'executions.recent': { paramsTuple?: []; params?: {} }
    'executions.check_status': { paramsTuple?: []; params?: {} }
    'admin.search_users': { paramsTuple?: []; params?: {} }
    'admin.get_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.grant_points': { paramsTuple?: []; params?: {} }
    'admin.make_emperor': { paramsTuple?: []; params?: {} }
    'admin.set_rank': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.update_rank': { paramsTuple?: []; params?: {} }
    'auth.upgrade_rank': { paramsTuple?: []; params?: {} }
    'auth.claim_stipend': { paramsTuple?: []; params?: {} }
    'auth.upload_image': { paramsTuple?: []; params?: {} }
    'posts.store': { paramsTuple?: []; params?: {} }
    'comments.store': { paramsTuple: [ParamValue]; params: {'postId': ParamValue} }
    'votes.store': { paramsTuple?: []; params?: {} }
    'groups.store': { paramsTuple?: []; params?: {} }
    'groups.store_message': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.join': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.leave': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.invite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'ai.ask': { paramsTuple?: []; params?: {} }
    'executions.store': { paramsTuple?: []; params?: {} }
    'admin.grant_points': { paramsTuple?: []; params?: {} }
    'admin.make_emperor': { paramsTuple?: []; params?: {} }
    'admin.set_rank': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'auth.me': { paramsTuple?: []; params?: {} }
    'posts.index': { paramsTuple?: []; params?: {} }
    'posts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.index': { paramsTuple?: []; params?: {} }
    'groups.my_groups': { paramsTuple?: []; params?: {} }
    'groups.get_posts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.get_messages': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'executions.index': { paramsTuple?: []; params?: {} }
    'executions.search_users': { paramsTuple?: []; params?: {} }
    'executions.recent': { paramsTuple?: []; params?: {} }
    'executions.check_status': { paramsTuple?: []; params?: {} }
    'admin.search_users': { paramsTuple?: []; params?: {} }
    'admin.get_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'auth.me': { paramsTuple?: []; params?: {} }
    'posts.index': { paramsTuple?: []; params?: {} }
    'posts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.index': { paramsTuple?: []; params?: {} }
    'groups.my_groups': { paramsTuple?: []; params?: {} }
    'groups.get_posts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.get_messages': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'executions.index': { paramsTuple?: []; params?: {} }
    'executions.search_users': { paramsTuple?: []; params?: {} }
    'executions.recent': { paramsTuple?: []; params?: {} }
    'executions.check_status': { paramsTuple?: []; params?: {} }
    'admin.search_users': { paramsTuple?: []; params?: {} }
    'admin.get_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'auth.update_profile': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}