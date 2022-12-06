require('./db/mongo')
const { PORT } = require('./utils/config')
const express = require('express')
const cors = require('cors')
const { handlerNotFound, handlerError, logger } = require('./utils/middleware')
const loginRouter = require('./routes/loginRouter')
const usersRouter = require('./routes/usersRouter')
const productsRouter = require('./routes/productsRouter')
const ordersRouter = require('./routes/ordersRouter')
const discountCodesRouter = require('./routes/discountCodesRouter')
const banksRouter = require('./routes/banksRouter')
const provincesRouter = require('./routes/provincesRouter')
const categoriesRouter = require('./routes/categoriesRouter')

const app = express()
app.use(cors())
app.use(express.json())
app.use(logger)

app.get('/', (req, res) => {
    res.send("<h1>Server running...</h1>")
})

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)
app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/discountCodes', discountCodesRouter)
app.use('/api/banks', banksRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/provinces', provincesRouter)

app.use(handlerNotFound)
app.use(handlerError)

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})

// Export the Express API
module.exports = app;