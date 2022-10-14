const usersRouter = require('express').Router()
const User = require("../models/User")
const bcrypt = require('bcryptjs')

usersRouter.get('/', async (req, res, next) => {
    try {
        const users = await User.find({})
        res.status(200).json({ success: true, data: users }).end()
    } catch (error) {
        next(err)
    }
})

usersRouter.post('/', async (req, res, next) => {
    try {
        const { username, password } = req.body
        const saltRounds = 10
        if (password.length < 8) {
            next({ name: "ValidationError", message: "password must by 8 chars at least" })
        } else {
            const passwordHash = await bcrypt.hash(password, saltRounds)
            const user = new User({
                username,
                passwordHash
            })
            const userSaved = await user.save(user)
            res.status(201).json({ success: true, data: userSaved }).end()
        }
    } catch (error) {
        next(error)
    }
})

module.exports = usersRouter