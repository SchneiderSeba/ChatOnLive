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
    `
    DROP TABLE IF EXISTS usermessages;
    CREATE TABLE IF NOT EXISTS usermessages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user TEXT, 
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
    const username = socket.handshake.auth.username ?? 'Anonymous'
    console.log({ username })
    try {
      const [rows] = await connection.query('INSERT INTO usermessages (content, user) VALUES (?, ?)', [msg, username])
      result = rows
    } catch (error) {
      console.error(error)
      return
    }
    console.log(result)
    // return result
    // await insertMessage(msg)
    io.emit('chat message', msg, result.insertId.toString(), username)
  })

  if (!socket.recovered) {
    try {
      const [result] = await connection.query('SELECT id, content, user FROM usermessages WHERE id > ?', [socket.handshake.auth.serverOffset ?? 0])
      result.forEach((row) => {
        socket.emit('chat message', row.content, row.id.toString(), row.user)
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
