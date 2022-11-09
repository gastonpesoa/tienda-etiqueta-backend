const loginRouter = require('express').Router()
const User = require("../models/User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../utils/config')

loginRouter.post('/', async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        const correctPass = user === null
            ? false
            : bcrypt.compare(password, user.password_hash)

        if (!(user && correctPass)) {
            next({ name: "ValidationError", message: "Incorrect password or username" })
        } else {
            const userToken = {
                email: user.email,
                id: user._id
            }
            const token = await jwt.sign(userToken, PRIVATE_KEY, { expiresIn: "120s" })
            res.status(200).json({ email, token }).end()
        }
    } catch (error) {
        next(error)
    }
})

module.exports = loginRouter