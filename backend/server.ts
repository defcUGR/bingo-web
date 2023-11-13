const express = require('express')
import * as http from 'http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import { draw, range } from 'radash'

const BINGO_PRESENTER_AUTH_TOKEN = process.env.BINGO_PRESENTER_AUTH_TOKEN

const prisma = new PrismaClient()

const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer)

const NUMBERS = Array.from(range(1, 99))

io.of('presenter').on('connection', (socket) => {
  console.info('connected to presenter')
  socket.on(
    'next',
    async (
      {
        bingo,
        authToken
      }: {
        bingo: 'numbers' | 'periodicTable' | 'symbols'
        authToken: string
      },
      callback
    ) => {
      if (authToken !== BINGO_PRESENTER_AUTH_TOKEN) return

      const getResult: () => string = {
        numbers: () => draw(NUMBERS)?.toString()
      }[bingo]

      let result = getResult()
      while (await prisma.result.findFirst({ where: { result } })) {
        result = getResult()
      }

      const next = await prisma.result.create({
        data: {
          result,
          bingo
        }
      })

      io.emit('result', next.result)

      callback(next)
    }
  )
})

app.get('/api/authPresenter', (req, res) => {
  console.info('qpi', req.query['token'], !req.query['token'])
  if (!req.query['token']) res.end()
  res.json(req.query['token'] === BINGO_PRESENTER_AUTH_TOKEN)
})

// Start the server listening on port 3000
httpServer.listen(3000, () => {
  console.log('Websocket server started on port 3000')
})

httpServer.on('close', async () => {
  await prisma.$disconnect()
})
