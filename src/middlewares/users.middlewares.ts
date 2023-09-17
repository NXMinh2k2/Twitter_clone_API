import { NextFunction, Request, RequestHandler, Response } from 'express'
import { ParamSchema, body, check, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize, isString } from 'lodash'
import { ObjectId } from 'mongodb'
import { envConfig } from '~/constants/config'
import { UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERNAME_REGEX } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/request/User.request'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'
import { verifyAccessToken } from '~/utils/commons'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const passwordSchema: ParamSchema = {
  notEmpty: true,
  isString: true,
  isLength: { options: { min: 6, max: 50 } },
  isStrongPassword: {
    options: {
      minLength: 6,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  }
}

const confirm_passwordSchema: ParamSchema = {
  notEmpty: true,
  isString: true,
  isLength: { options: { min: 6, max: 50 } },
  isStrongPassword: {
    options: {
      minLength: 6,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage:
      'Password must be at least 6 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirm password does not match password')
      }
      return true
    }
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: 'Forgot password token is required',
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: envConfig.jwtSecretForgotPasswordToken as string
        })
        const { user_id } = decoded_forgot_password_token
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (user === null) {
          throw new ErrorWithStatus({
            message: 'User not found',
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: 'Invalid forgot password token',
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        req.decoded_forgot_password_token = decoded_forgot_password_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: error.message,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
}

const nameSChema: ParamSchema = {
  notEmpty: true,
  isString: true,
  isLength: { options: { min: 1, max: 200 } },
  trim: true
}

const dataOfBirthSchema: ParamSchema = {
  isISO8601: { options: { strict: true, strictSeparator: true } }
}

const imageSchema: ParamSchema = {
  trim: true,
  optional: true,
  isString: true,
  isLength: {
    options: {
      min: 1,
      max: 400
    }
  }
}

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: 'invalid user id',
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      const followed_user = await databaseService.users.findOne({
        _id: new ObjectId(value)
      })

      if (followed_user === null) {
        throw new ErrorWithStatus({
          message: 'User not found',
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: true,
        notEmpty: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new Error('Email or Password incorrect')
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: true,
        isString: true,
        isLength: { options: { min: 6, max: 50 } },
        isStrongPassword: {
          options: {
            minLength: 6,
            minUppercase: 1,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1
          }
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSChema,
      email: {
        isEmail: true,
        notEmpty: true,
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await userService.checkEmailExistsInDatabase(value)
            if (isExistEmail) {
              throw new Error('Email already exists')
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirm_passwordSchema,
      date_of_birth: dataOfBirthSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            return await verifyAccessToken(access_token, req as Request)
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'Refresh token is required',
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: envConfig.jwtSecretRefreshToken as string }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: 'Refresh token is not exist',
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token as TokenPayload
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: error.message,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'Email_verify token token is required',
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: envConfig.jwtSecretEmailVerifyToken as string
              })
              req.decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: 'email is invalid'
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({ email: value })
            if (user === null) {
              throw new Error('User not found')
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirm_passwordSchema,
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const changePasswordValidator = validate(
  checkSchema({
    old_password: {
      ...passwordSchema,
      custom: {
        options: async (value, { req }) => {
          const { user_id } = req.decoded_authorization as TokenPayload
          const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
          if (!user) {
            throw new ErrorWithStatus({
              message: 'User not found',
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          const { password } = user
          if (password !== hashPassword(value)) {
            throw new ErrorWithStatus({
              message: 'Password not match',
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
        }
      }
    },
    password: passwordSchema,
    confirm_password: confirm_passwordSchema
  })
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = (req as any).decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: 'User not verified',
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSChema,
        optional: true,
        notEmpty: undefined
      },
      date_of_birth: {
        ...dataOfBirthSchema,
        optional: true
      },
      bio: {
        optional: true,
        isString: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          }
        },
        trim: true
      },
      location: {
        optional: true,
        isString: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          }
        },
        trim: true
      },
      website: {
        optional: true,
        isString: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          }
        },
        trim: true
      },
      username: {
        optional: true,
        isString: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!USERNAME_REGEX.test(value)) {
              throw Error('Username is invalid')
            }
            const user = await databaseService.users.findOne({
              username: value
            })
            if (user) {
              throw Error('User name is existed')
            }
          }
        },
        trim: true
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)

export const followValidator: any = validate(
  checkSchema(
    {
      followed_user_id: userIdSchema
    },
    ['params']
  )
)

export const getConversationValidator = validate(
  checkSchema(
    {
      receiver_id: userIdSchema
    },
    ['params']
  )
)

export const unfollowValidator = validate(
  checkSchema(
    {
      user_id: userIdSchema
    },
    ['params']
  )
)

export const isUserLoggedInValidator: any = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next)
    }
    next()
  }
}
