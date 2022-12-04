const loginRouter = require('express').Router()
const User = require("../models/User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../utils/config')

loginRouter.post('/', async (req, res, next) => {
    try {
        const { email, password } = req.body
        const userFinded = await User.findOne({ email })
        const correctPass = userFinded === null
            ? false
            : bcrypt.compare(password, userFinded.password_hash)

        if (!(userFinded && correctPass)) {
            next({ name: "ValidationError", message: "Incorrect password or username" })
        } else {
            const userToken = {
                email: userFinded.email,
                id: userFinded._id
            }
            const user = {
                id: userFinded._id,
                name: userFinded.name,
                last_name: userFinded.last_name,
                email: userFinded.email,
                address: userFinded.address,
                city: userFinded.city,
                province: userFinded.province,
                postal_code: userFinded.postal_code
            }
            const token = await jwt.sign(userToken, PRIVATE_KEY, { expiresIn: "7d" })
            res.status(200).json({ success: true, data: { user, token, } }).end()
        }
    } catch (error) {
        next(error)
    }
})

module.exports = loginRouter