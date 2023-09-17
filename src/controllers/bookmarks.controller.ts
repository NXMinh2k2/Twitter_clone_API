import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BookMarkTweetReqBody } from '~/models/request/Bookmark.request'
import { TokenPayload } from '~/models/request/User.request'
import bookmarkService from '~/services/bookmarks.services'
import tweetService from '~/services/tweets.services'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookMarkTweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id)
  return res.json({
    message: 'Bookmark tweet Successfully',
    result
  })
}

export const unBookmarkTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await bookmarkService.unBookmarkTweet(user_id, req.params.tweet_id)
  return res.json({
    message: 'Unbookmark tweet Successfully'
  })
}
