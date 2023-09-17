import express from 'express'
import {
  verifyEmailController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getMeController,
  updateMeController,
  getProfileController,
  followController,
  unfollowController,
  changePasswordController,
  oauthController,
  refreshTokenController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middleware'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/request/User.request'
import { wrapRequestHandler } from '~/utils/handlers'
const usersRouter = express.Router()

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags:
 *       - users
 *     summary: Đăng nhập
 *     description: Đăng nhập
 *     operationId: login
 *     requestBody:
 *       description: Thông tin đăng nhập
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *       required: true
 *     responses:
 *       "200":
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login success
 *                 result:
 *                   $ref: '#/components/schemas/SuccessAuthentication'
 *       "422":
 *         description: Invalid input
 */
usersRouter.post('/login', loginValidator, loginController)

/**
 * Description. Register a new user
 * Path: /register
 * Method: POST
 * Body: {name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO 8601}
 */

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description. Logout
 * Path: /Logout
 * Method: POST
 * Header: { Authorization: Bear: <access_token }
 * Body: {refresh_token: string}
 */

usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description. Refresh Token
 * Path: /refresh-token
 * Method: POST
 * Body: {refresh_token: string}
 */

usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 * Description. Verify email when user click on the link in email
 * Path: /verify-email
 * Method: POST
 * Body: {email_verify_token: string}
 */

usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 * Description. Resend verify email when user click on the link in email
 * Path: /resend-verify-email
 * Method: POST
 * Header: { Authorization: Bear <access_token> }
 */

usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * Description. Submit email to reset password, send emil to user
 * Path: /forgot-password
 * Method: POST
 * Body: { email: string }
 */

usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description. Verify link in email to reset password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: { forgot_password_token: string }
 */

usersRouter.post(
  '/verify-forgot-password',
  forgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description. Reset password
 * Path: /reset-password
 * Method: POST
 * Body: { forgot_password_token: string, password: string, confirm_password: string }
 */

usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/**
 * Description. Change password
 * Path: /change-password
 * Method: PUT
 * Header: { Authorization: Bear <access_token> }
 * Body: { old_password: string, password: string, confirm_password: string }
 */

usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

/**
 * Description. Get me profile
 * Path: /me
 * Method: GET
 * Header: { Authorization: Bear <access_token> }
 */

usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * Description. Update me profile
 * Path: /me
 * Method: PATCH
 * Header: { Authorization: Bear <access_token> }
 * Body: UserSchema
 */

usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * Description. Get user profile
 * Path: /username
 * Method: GET
 */

usersRouter.get('/:username', wrapRequestHandler(getProfileController))

/**
 * Description. Follow someone
 * Path: /follow
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { followed_user_id: string }
 */

usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

/**
 * Description. UnFollow someone
 * Path: /follow/user_id
 * Method: DELETE
 * Body: {followed_user_id: string}
 */

usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandler(unfollowController)
)

/**
 * Description. OAuth with Google
 * Path: /oauth/google
 * Method: GET
 * Query: {code: string}
 */
usersRouter.get('/oauth/google', wrapRequestHandler(oauthController))

export default usersRouter
