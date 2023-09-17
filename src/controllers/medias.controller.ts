import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import mediasService from '~/services/medias.services'
import fs from 'fs'
import mime from 'mime'

export const uploadImageController = async (req: any, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadImage(req)
  return res.json({
    message: 'Upload success',
    result: url
  })
}

export const uploadVideoController = async (req: any, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadVideo(req)
  return res.json({
    message: 'Upload success',
    result: url
  })
}

export const serveImageController = (req: any, res: any) => {
  const { name } = req.params
  console.log(name)
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, `${name}`), (err: any) => {
    if (err) {
      res.status(err.status).send('Not Found')
    }
  })
}

export const serveVideoStreamController = (req: any, res: any) => {
  const range = req.headers.range
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Required Range header')
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  // 1MB = 10^6 bytes (Tính theo hệ 10, đây là thứ mà chúng ta hay thấy trên UI)
  // 1MB = 2^20 bytes (tính theo hệ nhị phân)

  // Dung lượng video (bytes)
  const videoSize = fs.statSync(videoPath).size

  // Dung lượng video cho mỗi phân đoạn stream
  const chungkSize = 10 ** 6 // 1MB

  // Lấy giá trị byte bắt đầu (vd: bytes = 10)
  const start = Number(range.replace(/\D/g, ''))

  // Lấy giá trị byte kết thúc, vượt quá dung lượng video thì lấy giá trị videoSize
  const end = Math.min(start + chungkSize, videoSize - 1)

  // Dung lượng thực tế cho mỗi đoạn video stream
  // Thường đây sẽ là chunckSize, ngoại trừ đoạn cuối cùng

  const contentLength = end - start + 1
  const contentType = 'video/mp4'
  const headers = {
    'Content-Range': `bytes ${start} - ${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStreams = fs.createReadStream(videoPath, { start, end })
  videoStreams.pipe(res)
}
