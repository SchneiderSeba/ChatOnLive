import express from 'express'
import morgan from 'morgan'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
// import { insertMessage } from '../DataBase/ChatDB.js'
import { connection } from '../DataBase/ChatDB.js'

const PORT = process.env.PORT || 3000

const app = express()
const server = createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {}
})

await connection.query(
    `CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT, 
    content TEXT
    );`
)

io.on('connection', async (socket) => {
  console.log('A user connected')

  socket.on('disconnect', () => {
    console.log('A user disconnected')
  })

  socket.on('chat message', async (msg) => {
    let result
    try {
      const [rows] = await connection.query('INSERT INTO messages (content) VALUES (?)', [msg])
      result = rows
    } catch (error) {
      console.error(error)
      return
    }
    // return result
    // await insertMessage(msg)
    io.emit('chat message', msg, result.insertId.toString())
  })

  if (!socket.recovered) {
    try {
      const [rows] = await connection.query('SELECT id, content FROM messages WHERE id > ?', [socket.handshake.auth.serverOffset ?? 0])
      rows.forEach((row) => {
        socket.emit('chat message', row.content, row.id.toString())
      })
    } catch (error) {
      console.error(error)
    }
  }
})

app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/Client/index.html')
})

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`)
})
