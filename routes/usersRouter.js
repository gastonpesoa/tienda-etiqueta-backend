const usersRouter = require('express').Router()
const User = require("../models/User")
const bcrypt = require('bcryptjs')

usersRouter.post('/', async (req, res, next) => {
    try {
        const { name, last_name, email, password, address, city, state, postal_code } = req.body
        const saltRounds = 10
        if (password.length < 8) {
            next({ name: "ValidationError", message: "password must by 8 chars at least" })
        } else {
            const password_hash = await bcrypt.hash(password, saltRounds)
            const user = new User({ name, last_name, email, address, city, state, postal_code, password_hash })
            const userSaved = await user.save(user)
            res.status(201).json({ success: true, data: userSaved }).end()
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

module.exports = usersRouter