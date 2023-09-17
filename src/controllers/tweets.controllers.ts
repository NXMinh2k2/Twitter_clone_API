import { config } from 'dotenv'
import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetType } from '~/constants/enum'
import { Pagination, TweetParam, TweetQuery, TweetRequestBody } from '~/models/request/Tweet.request'
import { TokenPayload } from '~/models/request/User.request'
import tweetService from '~/services/tweets.services'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await tweetService.createTweet(user_id, req.body)
  return res.json({
    message: 'Create Tweet Successfully',
    result
  })
}

export const getTweetController = async (req: Request, res: Response) => {
  const result = await tweetService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)
  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }
  return res.json({
    message: 'Get tweet successfully',
    result: tweet
  })
}

export const getTweetChildrenController = async (req: Request<TweetParam, any, any, TweetQuery>, res: Response) => {
  const tweet_type = Number(req.query.tweet_type as string) as TweetType
  const page = Number(req.query.page as string)
  const limit = Number(req.query.limit as string)
  const user_id = req.decoded_authorization?.user_id as string

  const result = await tweetService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    tweet_type: tweet_type,
    page: page,
    limit: limit,
    user_id
  })

  return res.json({
    message: 'Get tweet children successfully',
    result: {
      tweets: result.tweets,
      tweet_type,
      limit,
      page,
      totalPage: Math.ceil(result.total_page / limit)
    }
  })
}

export const getNewFeedsController = async (req: Request<ParamsDictionary, any, any, Pagination>, res: Response) => {
  const page = Number(req.query.page as string)
  const limit = Number(req.query.limit as string)
  const user_id = req.decoded_authorization?.user_id as string

  const result = await tweetService.getNewFeeds({
    user_id,
    limit,
    page
  })

  return res.json({
    message: 'Get new feed successfully',
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  })
}
