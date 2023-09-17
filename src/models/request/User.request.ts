import { ParamSchema } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { ParamsDictionary } from 'express-serve-static-core'
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: phuc1@gmail.com
 *         password:
 *           type: string
 *           example: Phucdk@123
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjRkYjM4NTNlMjA2NTJjYzQ0NTlkNTA2IiwidG9rZW5fdHlwZSI6MCwidmVyaWZ5IjoxLCJpYXQiOjE2OTMzNjYxMDAsImV4cCI6MTY5MzM2NzAwMH0.gPDpyZzwST-qUv5a0Iy4xCanCBoTKkOdzfis831RFeA
 *         refresh_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjRkYjM4NTNlMjA2NTJjYzQ0NTlkNTA2IiwidG9rZW5fdHlwZSI6MSwidmVyaWZ5IjoxLCJpYXQiOjE2OTMzNjYxMDAsImV4cCI6MTcwMjAwNjEwMH0.egTlDDaXKD4C2e9VzV5HXz73u2_X8ICY3oRlciYP6B4
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: MongoId
 *           example: 64db3853e20652cc4459d506
 *         name:
 *           type: string
 *           example: Phuc
 *         email:
 *           type: string
 *           example: phuc1@gmail.com
 *         date_of_birth:
 *           type: string
 *           format: ISO8601
 *           example: 2011-10-05T14:48:00.000Z
 *         created_at:
 *           type: string
 *           format: ISO8601
 *           example: 2023-08-15T08:33:23.674Z
 *         updated_at:
 *           type: string
 *           format: ISO8601
 *           example: 2023-08-15T08:35:39.040Z
 *         verify:
 *           $ref: '*components/schemas/UserVerifyStatus'
 *         twitter_circle:
 *           type: array
 *           items:
 *             type: string
 *             format: MongoId
 *             example: "64e3896f71f0e1632519844d"
 *         bio:
 *           type: string
 *           example: ""
 *         location:
 *           type: string
 *           example: ""
 *         website:
 *           type: string
 *           example: ""
 *         username:
 *           type: string
 *           example: user64db3853e20652cc4459d506
 *         avatar:
 *           type: string
 *           example: ""
 *         cover_photo:
 *           type: string
 *           example: ""
 *     UserVerifyStatus:
 *       type: number
 *       enum: [Unverified, Verified, Banned]
 *       example: 1
 */

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface ForGotPassWordReqBody {
  email: string
}

export interface VerifyForGotPassWordReqBody {
  forgot_password_token: string
}

export interface ResetPasswordReqBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}

export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface FollowReqBody {
  followed_user_id: string
}

export interface UnFollowReqParams extends ParamsDictionary {
  user_id: string
}

export interface getProfileReqParams extends ParamsDictionary {
  username: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
  exp: number
  iat: number
}
