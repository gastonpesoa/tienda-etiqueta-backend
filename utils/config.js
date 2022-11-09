require('dotenv').config()

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI
const PRIVATE_KEY = process.env.PRIVATE_KEY

module.exports = {
    PORT, 
    MONGODB_URI,
    PRIVATE_KEY
}