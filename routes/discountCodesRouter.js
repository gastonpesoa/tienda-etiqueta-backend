const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../utils/config')
const discountCodesRouter = require('express').Router();
const DiscountCode = require("../models/DiscountCode");
const User = require("../models/User");

discountCodesRouter.get('/', (req, res, next) => {
    DiscountCode.find({})
        .then(discountCodes => {
            res.json({ success: true, data: discountCodes }).status(200).end();
        })
        .catch(err => {
            next(err);
        });
});

// Traer un código por ID
discountCodesRouter.get('/id/:id', (req, res, next) => {
    const id = req.params.id;
    DiscountCode.findById(id)
        .then(discountCode => {
            if (discountCode) {
                res.json({ success: true, data: discountCode }).status(200).end();
            } else {
                res.json({ success: false, data: 'Discount code not found' }).status(404).end();
            }
        })
        .catch(err => {
            next(err);
        });
});

// Verificar si un código existe y no se encuentra usado
discountCodesRouter.get('/code/:code', (req, res, next) => {
    const code = req.params.code;
    DiscountCode.find({ "code": code, "used": false })
        .then(discountCode => {
            res.json({ success: true, data: discountCode }).status(200).end();
        })
        .catch(err => {
            next(err);
        });
});

// Marca un código como usado
discountCodesRouter.put('/code/:code', (req, res, next) => {
    const { code } = req.params;

    DiscountCode.findOneAndUpdate({ "code": code }, { "used": true })
        .then((discountCode) => {
            discountCode ? res.status(200).json(discountCode) : res.status(404).end();
        })
        .catch(err => {
            next(err);
        });
});

// Agrega un código
discountCodesRouter.post('/', async (req, res, next) => {
    const { code, amount, used, due_date, created_by } = req.body;
    try {
        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin") {
                const newDiscountCode = new DiscountCode({ code, amount, used, due_date, created_by });
                newDiscountCode.used = false
                newDiscountCode.created_by = `${userFinded.name} ${userFinded.last_name}`
                newDiscountCode.save()
                    .then((discountCode) => {
                        discountCode ? res.status(201).send(discountCode) : res.status(400).send();
                    })
                    .catch((err) => {
                        next(err);
                    });
            }
        }
    } catch (error) {
        console.log(error)
        next(error);
    }

});

// Actualiza un código
discountCodesRouter.put('/id/:id', async (req, res, next) => {
    const { id } = req.params;
    const { code, amount, used, due_date, created_by } = req.body;

    try {
        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin") {
                const discountCodeToEdit = { code, amount, used, due_date, created_by };
                DiscountCode.findByIdAndUpdate(id, discountCodeToEdit, { new: true })
                    .then((discountCode) => {
                        discountCode ? res.status(200).json(discountCode) : res.status(404).end();
                    })
                    .catch(err => {
                        next(err);
                    });
            }
        }
    } catch (error) {
        console.log(error)
        next(error);
    }
});

// Elimina un código
discountCodesRouter.delete("/id/:id", async (req, res, next) => {
    const { id } = req.params;

    try {
        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin") {
                DiscountCode.findByIdAndRemove(id)
                    .then((obj) => {
                        obj ? res.status(200).json(obj) : res.status(404).end();
                    })
                    .catch((err) => {
                        next(err);
                    });
            }
        }
    } catch (error) {
        console.log(error)
        next(error);
    }
});

module.exports = discountCodesRouter;