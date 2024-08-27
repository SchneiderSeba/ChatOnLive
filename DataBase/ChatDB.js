import 'dotenv/config'
import mysql from 'mysql2/promise'
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from './config.js'

const config = {
  host: DB_HOST,
  user: DB_USER,
  port: DB_PORT,
  password: DB_PASSWORD,
  database: DB_NAME,
  connectTimeout: 10000
}

export const connectioN = await mysql.createConnection(config)

await connectioN.query(
  `CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT, 
  content TEXT
  );`
)

export const insertMessage = async (msg) => {
  let result
  try {
    const [rows] = await connectioN.query('INSERT INTO messages (content) VALUES (?)', [msg])
    result = rows
  } catch (error) {
    console.error(error)
  }
  return result
}
