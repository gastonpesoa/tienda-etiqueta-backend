const usersRouter = require('express').Router()
const User = require("../models/User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../utils/config')

usersRouter.get('/', async (req, res, next) => {
    try {
        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin") {
                const users = await User.aggregate([
                    {
                        $match: {
                            $or: [{ type: "admin" }, { type: "employee" }]
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            last_name: 1,
                            email: 1,
                            type: 1,
                        }
                    }
                ])
                res.status(201).json({ success: true, data: users }).end()
            }
        }

    } catch (error) {
        console.log(error)
        next(error)
    }
})

usersRouter.post('/', async (req, res, next) => {
    try {
        const { name, last_name, email, password, address, city, province, type, postal_code } = req.body
        const saltRounds = 10
        if (password.length < 8) {
            next({ name: "ValidationError", message: "La contraseña debe tener 8 caracteres como mínimo" })
        } else {
            const password_hash = await bcrypt.hash(password, saltRounds)
            const newUser = new User({ name, last_name, email, address, city, province, postal_code, type, password_hash })
            const userSaved = await newUser.save(newUser)
            const user = {
                name: userSaved.name,
                last_name: userSaved.last_name,
                email: userSaved.email,
                address: userSaved.address,
                city: userSaved.city,
                province: userSaved.province,
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

usersRouter.put('/', async (req, res, next) => {
    const bearerToken = req.headers['authorization']
    if (typeof bearerToken === 'undefined') {
        next({ name: "ErrorToken", message: "No token" })
    }
    try {
        req.token = bearerToken.split(' ')[1]
        const userData = jwt.verify(req.token, PRIVATE_KEY)
        const {
            name,
            last_name,
            email,
            telephone,
            address,
            city,
            province,
            postal_code
        } = req.body
        const infoUser = {}
        if (name) {
            infoUser.name = name
        }
        if (last_name) {
            infoUser.last_name = last_name
        }
        if (email) {
            infoUser.email = email
        }
        if (telephone) {
            infoUser.telephone = telephone
        }
        if (address) {
            infoUser.address = address
        }
        if (city) {
            infoUser.city = city
        }
        if (province) {
            infoUser.province = province
        }
        if (postal_code) {
            infoUser.postal_code = postal_code
        }
        var userUpdated = await User.findByIdAndUpdate(userData.id, infoUser, { new: true })
        if (userUpdated) {
            res.json({ success: true, data: userUpdated }).status(204).end()
        } else {
            res.json({ success: false, data: 'User not found' }).status(404).end()
        }
    } catch (error) {
        console.log(`err`, err)
        next(err)
    }
})

usersRouter.delete('/:id', async (req, res, next) => {
    const id = req.params.id
    const bearerToken = req.headers['authorization']
    if (typeof bearerToken === 'undefined') {
        next({ name: "ErrorToken", message: "No token" })
    } else {
        req.token = bearerToken.split(' ')[1]
        const userData = jwt.verify(req.token, PRIVATE_KEY)
        const userFinded = await User.findById(userData.id)
        if (userFinded.type === "admin") {
            console.log("ADMIN ID TO REMOVE", id)
            User.findByIdAndRemove(id)
                .then(user => {
                    if (user) {
                        res.json({ success: true, data: user }).status(204).end()
                    } else {
                        res.json({ success: false, data: 'User not found' }).status(404).end()
                    }
                })
                .catch(err => {
                    next(err)
                })
        }
    }
})

module.exports = usersRouter