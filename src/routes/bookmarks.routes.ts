import { Router } from 'express'
import { bookmarkTweetController, unBookmarkTweetController } from '~/controllers/bookmarks.controller'
import { createTweetController } from '~/controllers/tweets.controllers'
import { createTweetValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

export const bookmarksRouter = Router()

/**
 * Description: Bookmark Tweet
 * Path: '/'
 * Method: POST
 * Body: {tweet_id: string}
 * Header: {Authorization: Bearer <access_token>}
 */

bookmarksRouter.post(
  '',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkTweetController)
)

/**
 * Description: UnBookmark Tweet
 * Path: 'tweets/:tweet_id'
 * Method: DELETE
 * Header: {Authorization: Bearer <access_token>}
 */

bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unBookmarkTweetController)
)

export default bookmarksRouter
