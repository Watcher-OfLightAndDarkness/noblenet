// start/routes.ts - CORRECTED ORDER

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import fs from 'node:fs/promises'
import path from 'node:path'

// LAZY IMPORTS
const AuthController = () => import('#controllers/auth_controller')
const PostsController = () => import('#controllers/posts_controller')
const CommentsController = () => import('#controllers/comments_controller')
const VotesController = () => import('#controllers/votes_controller')
const GroupsController = () => import('#controllers/groups_controller')
const UsersController = () => import('#controllers/users_controller')
const ExecutionsController = () => import('#controllers/executions_controller')
const AdminController = () => import('#controllers/admin_controller')
const AiController = () => import('#controllers/ai_controller')

// ==========================================
// 1. SPECIFIC API ROUTES FIRST (no params)
// ==========================================

// Auth - Public
router.post('/api/register', [AuthController, 'register'])
router.post('/api/login', [AuthController, 'login'])

// Auth - Protected (individual routes, NOT grouped yet)
router.post('/api/logout', [AuthController, 'logout']).use(middleware.auth())
router.get('/api/me', [AuthController, 'me']).use(middleware.auth())
router.post('/api/me/rank', [AuthController, 'updateRank']).use(middleware.auth())
router.post('/api/me/upgrade', [AuthController, 'upgradeRank']).use(middleware.auth())
router.post('/api/me/stipend', [AuthController, 'claimStipend']).use(middleware.auth())
router.patch('/api/me', [AuthController, 'updateProfile']).use(middleware.auth())
router.post('/api/profile/image', [AuthController, 'uploadImage']).use(middleware.auth())

// Posts
router.get('/api/posts', [PostsController, 'index'])
router.post('/api/posts', [PostsController, 'store']).use(middleware.auth())
router.get('/api/posts/:id', [PostsController, 'show'])

// Comments
router.post('/api/posts/:postId/comments', [CommentsController, 'store']).use(middleware.auth())

// Votes
router.post('/api/vote', [VotesController, 'store']).use(middleware.auth())

// Groups - SPECIFIC FIRST
router.get('/api/groups', [GroupsController, 'index'])
router.post('/api/groups', [GroupsController, 'store']).use(middleware.auth())
router.get('/api/my-groups', [GroupsController, 'myGroups']).use(middleware.auth()) // BEFORE :id routes!

// Groups - DYNAMIC LAST (these catch anything)
router.get('/api/groups/:id/posts', [GroupsController, 'getPosts'])
router.get('/api/groups/:id/messages', [GroupsController, 'getMessages']).use(middleware.auth())
router.post('/api/groups/:id/messages', [GroupsController, 'storeMessage']).use(middleware.auth())
router.post('/api/groups/:id/join', [GroupsController, 'join']).use(middleware.auth())
router.post('/api/groups/:id/leave', [GroupsController, 'leave']).use(middleware.auth())
router.post('/api/groups/:id/invite', [GroupsController, 'invite']).use(middleware.auth())
router.get('/api/groups/:id', [GroupsController, 'show'])

// AI
router.post('/api/ask-ai', [AiController, 'ask']).use(middleware.auth())

// Executions
router.group(() => {
  router.post('/api/executions', [ExecutionsController, 'store'])
  router.get('/api/executions', [ExecutionsController, 'index'])
  router.get('/api/executions/search-users', [ExecutionsController, 'searchUsers'])
  router.get('/api/executions/recent', [ExecutionsController, 'recent'])
  router.get('/api/me/execution-status', [ExecutionsController, 'checkStatus'])
}).use(middleware.auth())

// Admin
router.group(() => {
  router.get('/users/search', [AdminController, 'searchUsers'])
  router.get('/users/:id', [AdminController, 'getUser'])
  router.post('/admin/grant-points', [AdminController, 'grantPoints'])
  router.post('/admin/make-emperor', [AdminController, 'makeEmperor'])
  router.post('/admin/set-rank', [AdminController, 'setRank'])
}).prefix('/api').use(middleware.auth())

// ==========================================
// 2. STATIC FILES
// ==========================================

router.get('/uploads/*', async ({ request, response }) => {
  const filePath = request.param('*').join('/')
  const fullPath = path.join(process.cwd(), 'public', 'uploads', filePath)

  try {
    const content = await fs.readFile(fullPath)
    const ext = path.extname(fullPath).toLowerCase()
    const contentType: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.jfif': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif'
    }
    return response.header('content-type', contentType[ext] || 'application/octet-stream').send(content)
  } catch {
    return response.notFound()
  }
})

router.get('/public/*', async ({ request, response }) => {
  const filePath = request.param('*').join('/')
  const fullPath = path.join(process.cwd(), 'public', filePath)

  try {
    const content = await fs.readFile(fullPath)
    const ext = path.extname(fullPath).toLowerCase()
    const contentTypes: Record<string, string> = {
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    }
    return response.header('content-type', contentTypes[ext] || 'application/octet-stream').send(content)
  } catch {
    return response.notFound()
  }
})

router.get('/sounds/*', async ({ request, response }) => {
  const filePath = request.param('*').join('/')
  const fullPath = path.join(process.cwd(), 'public', 'sounds', filePath)

  try {
    const content = await fs.readFile(fullPath)
    const ext = path.extname(fullPath).toLowerCase()
    const contentType = ext === '.mp3' ? 'audio/mpeg' : 'application/octet-stream'
    return response.header('content-type', contentType).send(content)
  } catch {
    // Return empty audio or 404 - don't crash
    return response.status(404).send('Sound not found')
  }
})

router.get('/default-avatar.png', async ({ response }) => {
  const fullPath = path.join(process.cwd(), 'public', 'images', 'default-avatar.png')
  try {
    const content = await fs.readFile(fullPath)
    return response.header('content-type', 'image/png').send(content)
  } catch {
    return response.redirect('https://via.placeholder.com/100?text=User')
  }
})

// ==========================================
// 3. HTML PAGES (CATCH-ALL LAST)
// ==========================================

const htmlPages = [
  '/', '/login.html', '/register.html', '/profile.html',
  '/write-post.html', '/post.html', '/create-group.html',
  '/group.html', '/chat.html', '/executions.html',
  '/creator-panel.html', '/royal-advisor.html'
]

for (const page of htmlPages) {
  router.get(page, async ({ response }) => {
    const fileName = page === '/' ? 'index.html' : page
    try {
      const html = await fs.readFile(path.join(process.cwd(), 'public', fileName), 'utf-8')
      return response.header('content-type', 'text/html').send(html)
    } catch {
      return response.notFound()
    }
  })
}
router.get('/.well-known/*', async ({ response }) => {
  return response.status(404).send('')
})

router.get('*', async ({ request, response }) => {`z  `
  if (process.env.NODE_ENV === 'development') {
    console.log(`Unmatched route: ${request.method()} ${request.url()}`)
  }
  return response.status(404).send('Not found')
})
