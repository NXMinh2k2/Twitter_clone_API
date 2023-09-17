import express from 'express'
import usersRouter from './routes/users.routes'
import bodyParser from 'body-parser'
import databaseService from './services/database.services'
import defaultErrorHandler from './middlewares/error.middlewares'
import mediasRouter from './routes/media.routes'
import { initFolder } from './utils/file'
import cors from 'cors'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import { tweetsRouter } from './routes/tweets.routes'
import { bookmarksRouter } from './routes/bookmarks.routes'
import { searchRouter } from './routes/search.routes'
import { createServer } from 'http'
import { conversationRouter } from './routes/conversation.routes'
import initSocket from './utils/socket'
import helmet from 'helmet'
import fs from 'fs'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import { config } from 'dotenv'
import { envConfig, isProduction } from './constants/config'
import { rateLimit } from 'express-rate-limit'

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Twitter API',
      version: '1.0.0'
    }
  },
  apis: ['./openapi/*.yaml']
}
const openapiSpecification = swaggerJSDoc(options)

const app = express()
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: 'draft-7', // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false // X-RateLimit-* headers
  // store: ... , // Use an external store for more precise rate limiting
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

const httpServer = createServer(app)

app.use(helmet())
const corsOptions = {
  origin: isProduction ? envConfig.clientUrl : '*'
}
app.use(cors(corsOptions))
const port = envConfig.port
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})

// Tạo folder upload
initFolder()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/conversations', conversationRouter)
app.use('/search', searchRouter)
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)

initSocket(httpServer)
httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
