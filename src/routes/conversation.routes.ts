import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversations.controller'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, getConversationValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

export const conversationRouter = Router()

conversationRouter.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  getConversationValidator,
  wrapRequestHandler(getConversationsController)
)
