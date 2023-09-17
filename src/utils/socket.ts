import { ObjectId } from 'mongodb'
import { Server } from 'socket.io'
import { Conversation } from '../models/schemas/Conversation.chema'
import { verifyAccessToken } from '../utils/commons'
import { UserVerifyStatus } from '../constants/enum'
import { TokenPayload } from '../models/request/User.request'
import { ErrorWithStatus } from '../models/Errors'
import HTTP_STATUS from '../constants/httpStatus'
import databaseService from '~/services/database.services'

const initSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    /* options */
    cors: {
      origin: 'http://localhost:3000'
    }
  })

  const users: {
    [key: string]: {
      socket_id: string
    }
  } = {}

  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization?.split(' ')[1]
    try {
      const decoded_authorization = await verifyAccessToken(access_token)
      const { verify } = decoded_authorization as TokenPayload

      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: 'User not verified',
          status: HTTP_STATUS.FORBIDDEN
        })
      }
      // Truyền decoded_authorizatoin vào socket để sử dụng ở các middleware khác
      socket.handshake.auth.decoded_authorization = decoded_authorization
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })

  io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`)
    const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload
    users[user_id] = {
      socket_id: socket.id
    }

    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth
      try {
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })

    socket.on('error', (error) => {
      if (error.message === 'Unauthorized') {
        socket.disconnect()
      }
    })

    socket.on('send_message', async (data) => {
      const { payload } = data
      console.log(payload)
      const receiver_socket_id = users[payload.receiver_id]?.socket_id

      const conversation = new Conversation({
        sender_id: new ObjectId(payload.sender_id),
        receiver_id: new ObjectId(payload.receiver_id),
        content: payload.content
      })

      const result = await databaseService.conversations.insertOne(conversation)
      conversation._id = result.insertedId

      if (receiver_socket_id) {
        socket.to(receiver_socket_id).emit('receive_message', {
          payload: conversation,
          from: user_id
        })
      }
    })
    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`user ${socket.id} disconnected`)
    })
  })
}

export default initSocket
