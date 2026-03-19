import { defineConfig } from '@adonisjs/lucid'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'

const dbConfig = defineConfig({
  connection: 'mysql',
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'noble_net',

        // Add SSL for production/TiDB Cloud
        ssl: process.env.NODE_ENV === 'production'
          ? {
              ca: readFileSync(app.makePath('ca.pem')),
              rejectUnauthorized: true
            }
          : false
      },
      migrations: {
        naturalSort: true,
        disableTransactions: true,  // Required for TiDB
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
