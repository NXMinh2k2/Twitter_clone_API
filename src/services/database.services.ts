import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/models/schemas/User.schema'
import { error } from 'console'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { Follower } from '~/models/schemas/Follower.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { Bookmark } from '~/models/schemas/Bookmark.schema'
import { Conversation } from '~/models/schemas/Conversation.chema'
import { envConfig } from '~/constants/config'
dotenv.config()

const uri =
  `mongodb+srv://${envConfig.dbUsername}:` +
  encodeURIComponent(`${envConfig.dbPassword}`) +
  `@twitter.lpnsk4s.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(`${envConfig.dbName}`)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
    } catch {
      console.log(error)
    }
  }

  async indexUsers() {
    const indexExists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])
    if (!indexExists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async indexRefreshTokens() {
    const indexExists = await this.refreshTokens.indexExists(['exp_1', 'token_1'])
    if (!indexExists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }

  async indexFollowers() {
    const indexExists = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
    if (!indexExists) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }

  async indexTweets() {
    const indexExists = await this.tweets.indexExists('content_text')
    if (!indexExists) {
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
    }
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.dbTweetsCollection as string)
  }

  get users(): Collection<User> {
    return this.db.collection(envConfig.dbUsersCollection as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokensCollection as string)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(envConfig.dbFollowersCollection as string)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(envConfig.dbHashtagsCollection as string)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(envConfig.dbBookmarksCollection as string)
  }

  get conversations(): Collection<Conversation> {
    return this.db.collection(envConfig.dbConversationCollection as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
