const express = require('express')
import * as http from 'http'
import { Server } from 'socket.io'
import { PrismaClient, type Result } from '@prisma/client'
import { draw } from 'radash'
import * as fs from 'fs'
import type { AuthedEvent, BingoJSON, CallbackClearType, CallbackResultType } from './types'

const BINGO_PRESENTER_AUTH_TOKEN = process.env.BINGO_PRESENTER_AUTH_TOKEN

const prisma = new PrismaClient()

const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer)

const BINGOS = JSON.parse(fs.readFileSync('./bingos.json', 'utf8')) as BingoJSON

io.of('presenter').on('connection', (socket) => {
  console.info('connected to presenter')
  socket.on(
    'next',
    async (
      {
        bingo,
        authToken
      }: {
        bingo: string
      } & AuthedEvent,
      callback: CallbackResultType
    ) => {
      if (authToken !== BINGO_PRESENTER_AUTH_TOKEN) {
        callback({
          error: 'Token de presentador errónea'
        })
        return
      }
      const BINGO = BINGOS.find((b) => b.key === bingo)
      if (!BINGO) {
        callback({
          error: 'Bingo incorrecto'
        })
        return
      }
      if ((await prisma.result.count()) === BINGO['results'].length) {
        callback({
          error: 'Todos los resultados usados'
        })
        return
      }

      const getResult = () =>
        draw(BINGO['results']) as { key: string; value: string; index: number }

      let result = getResult()
      while (await prisma.result.findFirst({ where: { result: result.key } })) {
        result = getResult()
      }

      await prisma.result.create({
        data: {
          bingo: bingo,
          result: result.key
        }
      })

      io.of('viewer').emit('result', result.value)
      io.of('volunteer').emit('result', { bingo: bingo, key: result.key, index: result.index })

      callback({ error: null, result: { key: result.key, value: result.value } })
    }
  )

  socket.on(
    'clear',
    async (
      {
        bingo,
        authToken
      }: {
        bingo: string
      } & AuthedEvent,
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

      io.of('volunteer').emit('clear', bingo)
    }
  )
})

io.of('volunteer').on('connection', (socket) => {
  console.info('connected to volunteer')
})

io.of('viewer').on('connection', (socket) => {
  console.info('connected to viewer')
})

app.get('/api/authPresenter', (req, res) => {
  if (!req.query['token']) res.end()
  res.json(req.query['token'] === BINGO_PRESENTER_AUTH_TOKEN)
})

app.get('/api/bingos', (req, res) => {
  res.json(
    BINGOS.map((bingo) => {
      return { key: bingo.key, value: bingo.value }
    })
  )
})

app.get('/api/history', async (req, res) => {
  const results = [] as {
    key: string
    value: string
    results: {
      key: string
      index: number
    }[]
  }[]
  const dbResults = await prisma.result.findMany()
  for (const bingo of BINGOS) {
    const dbFiltered = dbResults
      .filter((result) => result.bingo === bingo.key)
      .map((result) => {
        const bingoResult = bingo.results.find((r) => r.key === result.result)
        return { key: result.result, index: bingoResult!.index }
      })
    results.push({ key: bingo.key, value: bingo.value, results: dbFiltered })
  }
  res.json(results)
})

// Start the server listening on port 3000
httpServer.listen(3000, () => {
  console.log('Websocket server started on port 3000')
})

httpServer.on('close', async () => {
  await prisma.$disconnect()
})
