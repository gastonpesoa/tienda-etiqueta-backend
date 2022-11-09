const usersRouter = require('express').Router()
const User = require("../models/User")
const bcrypt = require('bcryptjs')

usersRouter.post('/', async (req, res, next) => {
    try {
        const { name, lastName, email, password, address, city, state, postalCode } = req.body
        const saltRounds = 10
        if (password.length < 8) {
            next({ name: "ValidationError", message: "password must by 8 chars at least" })
        } else {
            const passwordHash = await bcrypt.hash(password, saltRounds)
            const user = new User({ name, lastName, email, address, city, state, postalCode, passwordHash })
            const userSaved = await user.save(user)
            res.status(201).json({ success: true, data: userSaved }).end()
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

module.exports = usersRouter