import fastify from 'fastify'
import cors from '@fastify/cors'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { appRouter, createContext } from './trpc'
import type { AppRouter } from './trpc/router'
import fastifyCookie from '@fastify/cookie'
import { AppDataSource } from './data-source'
import dotenv from 'dotenv'
import { updateDefaultTemplate } from './services/template'
import { DEFAULT_HTML_TEMPLATE, DEFAULT_CUSTOM_CSS } from './templates/0.1'

// Load environment variables
dotenv.config()

const server = fastify({
  maxParamLength: 5000,
})

server.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  try {
    var json = JSON.parse(body as string)
    done(null, json)
  } catch (err) {
    err.statusCode = 400
    done(err, undefined)
  }
})

const handlePublicCORS = (req: any, reply: any, done: any) => {
  const requestPath = req.raw.url
  if (requestPath.startsWith('/trpc/priceTable.renderTable')) {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type')
  }
  done()
}

server.addHook('onRequest', handlePublicCORS)

server.register(cors, {
  origin: (origin, cb) => {
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      cb(null, true)
      return
    }
    cb(new Error("Not allowed"), false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

// Replace cookie-parser with fastify cookie plugin
server.register(fastifyCookie)

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext,
    onError(opts) {
      const { error, type, path, input, ctx, req } = opts
      console.error('TRPC Error:', {
        type,
        path,
        input,
        error: error.message,
        stack: error.stack
      })
    },
  },
})

// Create the default template on load, make sure to point to the right version
export async function createDefaultTemplate() {
  try {
    await updateDefaultTemplate({
      name: "Default Template",
      htmlTemplate: DEFAULT_HTML_TEMPLATE,
      customCSS: DEFAULT_CUSTOM_CSS
    })
    console.log('Default template created or updated successfully')
  } catch (error) {
    console.error('Error creating/updating default template:', error)
    // Handle the error appropriately
  }
}

async function connectWithRetry(retries = 5, delay = 5000) {
  while (retries > 0) {
    try {

      await AppDataSource.initialize()
      console.log("Data Source has been initialized!")
      await AppDataSource.runMigrations()
      console.log("Migrations have been run successfully!")
      await createDefaultTemplate()
      console.log("Default template created")
      return
    } catch (err) {
      console.error('Failed to connect to the database or run migrations. Retrying...')
      retries--
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Unable to connect to the database or run migrations after multiple attempts')
}



async function main() {
  try {
    await connectWithRetry()
    await server.listen({ port: 3000, host: '0.0.0.0' })
    console.log(`Server listening on http://localhost:3000`)
  } catch (err) {
    console.error('Failed to start the server:', err)
    if (err instanceof Error) {
      console.error('Error message:', err.message)
      console.error('Stack trace:', err.stack)
    }
    server.log.error(err)
    process.exit(1)
  }
}

main()

// Export type router type signature for client usage
export type { AppRouter }