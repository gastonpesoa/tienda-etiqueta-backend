const usersRouter = require('express').Router()
const User = require("../models/User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../utils/config')

usersRouter.post('/', async (req, res, next) => {
    try {
        const { name, last_name, email, password, address, city, state, postal_code } = req.body
        const saltRounds = 10
        if (password.length < 8) {
            next({ name: "ValidationError", message: "La contraseña debe tener 8 caracteres como mínimo" })
        } else {
            const password_hash = await bcrypt.hash(password, saltRounds)
            const newUser = new User({ name, last_name, email, address, city, state, postal_code, password_hash })
            const userSaved = await newUser.save(newUser)
            const user = {
                name: userSaved.name,
                last_name: userSaved.last_name,
                email: userSaved.email,
                address: userSaved.address,
                city: userSaved.city,
                state: userSaved.state,
                postal_code: userSaved.postal_code
            }
            const userToken = {
                email: newUser.email,
                id: newUser._id
            }
            const token = await jwt.sign(userToken, PRIVATE_KEY, { expiresIn: "7d" })
            res.status(201).json({ success: true, data: { user, token, } }).end()
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

module.exports = usersRouter