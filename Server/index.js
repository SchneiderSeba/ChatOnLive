import express from 'express'
import morgan from 'morgan'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
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
    content TEXT, 
    )`
)


io.on('connection', (socket) => {
    console.log('A user connected')

    socket.on('disconnect', () => {
        console.log('A user disconnected')
    })

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg)
    })
})


app.use(morgan('dev'))

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/Client/index.html')
})

server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`)
})



