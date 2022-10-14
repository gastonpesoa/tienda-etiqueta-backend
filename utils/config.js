require('dotenv').config()

const PORT = process.env.PORT
const DB_URI = process.env.DB_URI
const PRIVATE_KEY = process.env.PRIVATE_KEY

module.exports = {
    PORT, 
    DB_URI,
    PRIVATE_KEY
}