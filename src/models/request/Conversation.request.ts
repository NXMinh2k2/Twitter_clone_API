import { ParamsDictionary } from 'express-serve-static-core'

export interface getConversationParams extends ParamsDictionary {
  reciver_id: string
}
