const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../utils/config')
const mongoose = require('mongoose')
const ordersRouter = require('express').Router()
const Order = require("../models/Order")
const User = require("../models/User")
const Product = require("../models/Product")
const Billing = require("../models/Billing")
const Card = require("../models/Card")
const DiscountCode = require("../models/DiscountCode");
const Bank = require("../models/Bank");
const Province = require("../models/Province");
const { verifyToken } = require('../utils/middleware');

ordersRouter.use(verifyToken);

ordersRouter.get('/', async (req, res, next) => {
    try {
        const user = req.tokenPayload;
        const orders = await Order.aggregate([
            {
                $project: {
                    "user._id": 1,
                    date: 1,
                    state: 1,
                    "items.product.title": 1,
                    "items.units": 1,
                    "items.size": 1
                }
            },
            { $match: { "user._id": mongoose.Types.ObjectId(user.id) } }
        ])
        res.status(201).json({ success: true, data: orders }).end()

    } catch (error) {
        console.log(error)
        next(error)
    }
})

ordersRouter.get('/all', async (req, res, next) => {
    try {
        const orders = await Order.aggregate([
            {
                $project: {
                    "user._id": 1,
                    date: 1,
                    state: 1,
                    "items.product.title": 1,
                    "items.product.articles.size": 1,
                    "items.units": 1
                }
            }
        ])
        res.status(201).json({ success: true, data: orders }).end()

    } catch (error) {
        console.log(error)
        next(error)
    }
})

ordersRouter.get('/id/:id', (req, res, next) => {
    const id = req.params.id
    Order.findById(id)
        .then(order => {
            if (order) {
                res.json({ success: true, data: order }).status(200).end()
            } else {
                res.json({ success: false, data: 'Order not found' }).status(404).end()
            }
        })
        .catch(err => {
            next(err)
        })
})

ordersRouter.get('/quantity-by-month/:month', async (req, res, next) => {
    const month = parseInt(req.params.month)

    var today = new Date();
    var firstDayOfMonth = new Date(today.getFullYear(), month, 1);
    var lastDayOfMonth = new Date(today.getFullYear(), month + 1, 0);

    try {
        const orders = await Order.aggregate([
            {
                $match: {
                    date: {
                        $gte: firstDayOfMonth,
                        $lt: lastDayOfMonth
                    }
                }
            },
            {
                $project: {
                    "user._id": 1,
                    date: 1,
                    "billing.total_cost": 1
                }
            }
        ])
        res.status(201).json({ success: true, data: orders }).end()

    } catch (error) {
        console.log(error)
        next(error)
    }
})

ordersRouter.get('/avg-sales-by-month/:month', async (req, res, next) => {
    const month = parseInt(req.params.month)

    var today = new Date();
    var firstDayOfMonth = new Date(today.getFullYear(), month, 1);
    var lastDayOfMonth = new Date(today.getFullYear(), month + 1, 0);

    try {
        const orders = await Order.aggregate([
            {
                $match: {
                    date: {
                        $gte: firstDayOfMonth,
                        $lt: lastDayOfMonth
                    }
                }
            },
            {
                $project: {
                    "user._id": 1,
                    date: 1,
                    "billing.total_cost": 1
                }
            },
            {
                $group:
                {
                    _id: null,
                    salesAvg: { $avg: "$billing.total_cost" }
                }
            },
        ])
        res.status(201).json({ success: true, data: orders }).end()

    } catch (error) {
        console.log(error)
        next(error)
    }
})

ordersRouter.post('/', async (req, res, next) => {
    try {

        const {
            name, last_name, email, address, city, province, postal_code, telephone_number,
            delivery_method, payment_method,
            card_number, titular, due_date, cvc, bank_id, discount_code,
            order_notes, items
        } = req.body;

        let products = []
        let bank = null
        let subtotalCost = 0
        let shippingCost = 0
        let totalCost = 0

        const user = req.tokenPayload;
        const userFinded = await User.findById(user.id)

        const productsSkus = items.map(item => item.product_sku)
        const productsFinded = await Product.aggregate([
            { $unwind: "$articles" },
            { $match: { "articles.sku": { "$in": productsSkus } } }
        ])

        items.map(item => {
            let product = productsFinded.find(x => x.articles.sku === item.product_sku);
            Product.findById(product._id)
                .then(prod => {
                    let article = prod.articles.find(x => x.sku === item.product_sku)
                    article.stock -= item.units
                    prod.save()
                }).catch(err => {
                    console.log("err", err)
                })
        })

        items.map(item => {
            let product = productsFinded.find(x => x.articles.sku === item.product_sku);
            subtotalCost += product.price * item.units
            products.push({ product: product, units: item.units })
        })

        totalCost = subtotalCost

        const billing = new Billing({
            name: name,
            last_name: last_name,
            email: email,
            address: address,
            telephone: telephone_number,
            city: city,
            province: province,
            postal_code: postal_code,
            subtotal_cost: subtotalCost
        })

        if (bank_id) {
            const bankFinded = await Bank.findById(bank_id)
            if (bankFinded?.discount_status) {
                bank = bankFinded
                billing.discount_bank = bankFinded.bank
                let discountBankAmount = subtotalCost * (bankFinded.discount / 100)
                billing.discount_bank_amount = discountBankAmount
                totalCost -= discountBankAmount
            }
        }

        if (discount_code) {
            const discountCodeFinded = await DiscountCode.findOne({ "code": discount_code, "used": false })
            const actualDate = new Date();
            if (discountCodeFinded && actualDate < discountCodeFinded.due_date) {
                billing.discount_code = discountCodeFinded.code
                billing.discount_code_amount = discountCodeFinded.amount
                totalCost -= discountCodeFinded.amount
                await DiscountCode.findOneAndUpdate({ "code": discountCodeFinded.code }, { "used": true })
            }
        }

        if (delivery_method === 'Env??o a domicilio') {
            const provinceFinded = await Province.findOne({ "value": province })
            if (provinceFinded) {
                shippingCost = provinceFinded.shippingCost
                billing.shipping_cost = shippingCost
                totalCost += shippingCost
            }
        }

        billing.total_cost = totalCost

        const order = new Order({
            date: Date.now(),
            last_update_date: Date.now(),
            user: userFinded,
            billing: billing,
            delivery_method: delivery_method,
            payment_method: payment_method,
            items: products,
            order_notes: order_notes,
            state: 'CONFIRMADA'
        })

        if (payment_method === 'Tarjeta de cr??dito') {
            order.card = new Card({
                type: bank?.bank,
                number: card_number,
                titular: titular,
                due_date: due_date,
                cvc: cvc
            })
        }

        const orderSaved = await order.save(order)
        res.status(201).json({ success: true, data: orderSaved }).end()

    } catch (error) {
        console.log(error)
        next(error)
    }
})

ordersRouter.put('/state/:id', async (req, res, next) => {
    try {
        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin" || userFinded.type === "employee") {
                const { id } = req.params;
                const { state } = req.body;
                const orderToEdit = { state };

                if (state == 'CANCELADA') {
                    const order = await Order.findById(id);
                    order.items.forEach(async (item) => {
                        let product = await Product.findById(item.product._id)
                        for (article of product.articles) {
                            if (article.size == item.product.articles[0].size) {
                                article.stock += item.units;
                                product.save();
                            }
                        }
                    });

                    let user = await User.findById(order.user._id);
                    if (user.warnings === undefined) {
                        user.warnings = 1;
                    } else {
                        user.warnings += 1;
                    }
                    user.save();
                } else if (state == 'ENTREGADA') {
                    const order = await Order.findById(id);
                    let user = await User.findById(order.user._id);
                    if (user.warnings === undefined) {
                        user.warnings = 0;
                    } else if (user.warnings > 0) {
                        user.warnings -= 1;
                    }
                    user.save();
                }

                Order.findByIdAndUpdate(id, orderToEdit, { new: true })
                    .then((obj) => {
                        obj ? res.status(200).json(obj) : res.status(404).end();
                    })
                    .catch(err => {
                        next(err);
                    });
            }
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

module.exports = ordersRouter