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

type CallbackResultType = (
  cbk:
    | {
        error: string
      }
    | {
        error: null
        result: {
          id: number
          result: string
          bingo: string
        }
      }
) => void

type CallbackClearType = (cbk: { error: string | null }) => void

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
      callback: CallbackResultType
    ) => {
      if (authToken !== BINGO_PRESENTER_AUTH_TOKEN) {
        callback({
          error: 'Token de presentador errónea'
        })
        return
      }
      if ((await prisma.result.count()) === NUMBERS.length) {
        callback({
          error: 'Todos los números usados'
        })
        return
      }

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

      callback({ error: null, result: next })
    }
  )

  socket.on(
    'clear',
    async (
      {
        bingo,
        authToken
      }: {
        bingo: 'numbers' | 'periodicTable' | 'symbols'
        authToken: string
      },
      callback: CallbackClearType
    ) => {
      if (authToken !== BINGO_PRESENTER_AUTH_TOKEN) {
        callback({
          error: 'Token de presentador errónea'
        })
        return
      }

      prisma.result
        .deleteMany({
          where: {
            bingo
          }
        })
        .then(() => callback({ error: null }))
        .catch((e) => callback({ error: e.toString() }))
    }
  )
})

app.get('/api/authPresenter', (req, res) => {
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
