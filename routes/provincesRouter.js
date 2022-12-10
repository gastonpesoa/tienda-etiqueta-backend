const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../utils/config')
const provincesRouter = require('express').Router();
const Province = require("../models/Province");
const User = require("../models/User");

provincesRouter.get('/', (req, res, next) => {
    Province.find({})
        .then(objs => {
            res.json({ success: true, data: objs }).status(200).end();
        })
        .catch(err => {
            next(err);
        });
});

provincesRouter.post('/', async (req, res, next) => {
    try {
        const { value, shippingCost } = req.body
        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin" || userFinded.type === "employee") {
                const newProvince = new Province({ value, shippingCost })
                const provinceSaved = await newProvince.save(newProvince)
                res.status(201).json({ success: true, data: { provinceSaved } }).end()
            }
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

provincesRouter.put('/', async (req, res, next) => {
    try {
        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin" || userFinded.type === "employee") {
                const { id, value, shippingCost } = req.body
                console.log("req.body", req.body)
                const infoProvince = {}
                if (value) {
                    infoProvince.value = value
                }
                if (shippingCost) {
                    infoProvince.shippingCost = shippingCost
                }
                var provinceUpdated = await Province.findByIdAndUpdate(id, infoProvince, { new: true })
                if (provinceUpdated) {
                    res.json({ success: true, data: provinceUpdated }).status(204).end()
                } else {
                    res.json({ success: false, data: 'Province not found' }).status(404).end()
                }
            }
        }
    } catch (error) {
        console.log(`err`, err)
        next(err)
    }
})

provincesRouter.delete('/:id', async (req, res, next) => {
    const id = req.params.id
    const bearerToken = req.headers['authorization']
    if (typeof bearerToken === 'undefined') {
        next({ name: "ErrorToken", message: "No token" })
    } else {
        req.token = bearerToken.split(' ')[1]
        const userData = jwt.verify(req.token, PRIVATE_KEY)
        const userFinded = await User.findById(userData.id)
        if (userFinded.type === "admin" || userFinded.type === "employee") {
            Province.findByIdAndRemove(id)
                .then(province => {
                    if (province) {
                        res.json({ success: true, data: province }).status(204).end()
                    } else {
                        res.json({ success: false, data: 'Province not found' }).status(404).end()
                    }
                })
                .catch(err => {
                    next(err)
                })
        }
    }
})

module.exports = provincesRouter;