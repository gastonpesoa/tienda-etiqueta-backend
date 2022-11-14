const mongoose = require('mongoose')
const ordersRouter = require('express').Router()
const Order = require("../models/Order")
const User = require("../models/User")
const Product = require("../models/Product")
const Billing = require("../models/Billing")
const Card = require("../models/Card")
const { verifyToken } = require('../utils/middleware');
const { calculateTotalCost } = require('../utils/ordersHelper');

ordersRouter.use(verifyToken);

ordersRouter.post('/', async (req, res, next) => {
    try {

        console.log('ordersRouter.post')

        const {
            name, last_name, email, address, city, province, postal_code, telephone_number,
            delivery_method, payment_method,
            card_number, titular, due_date, cvc,
            order_notes,
            items
        } = req.body;

        const user = req.tokenPayload;

        console.log('user', user)

        const userFinded = await User.findById(user.id)
        console.log('userFinded.name', userFinded.name)
        
        // var prod = []
        // items.forEach((item) => {
        //     var p = Product.findById(item.id)
        //     prod = [...items, p]
        // })

        // var products = items.map((item) => {
        //     Product.findById(item.id)
        // })
        // console.log('products', products)
        // const productsFinded = await Product.find({ "_id": { "$in": [productIds] } });
        // console.log('productsFinded', productsFinded)
        // var productsArrange = productsFinded.map(item => {
        //     return { }
        // })
        const totalCost = calculateTotalCost(items)
        console.log('totalCost', totalCost)

        const billing = new Billing({
            name: name,
            lastName: last_name,
            email: email,
            address: address,
            telephone: telephone_number,
            city: city,
            state: province,
            postalCode: postal_code,
            cost: totalCost,
            state: province
        })

        const card = payment_method !== 'cash'
            ? new Card({
                type: payment_method,
                number: card_number,
                titular: titular,
                due_date: due_date,
                cvc: cvc
            })
            : null

        const order = new Order({
            user: userFinded,
            billing: billing,
            delivery_method: delivery_method,
            payment_method: payment_method,
            card: card,
            items: items,
            order_notes: order_notes,
            state: 'CONFIRMADA'
        })

        const orderSaved = await order.save(order)
        res.status(201).json({ success: true, data: orderSaved }).end()

    } catch (error) {
        console.log(error)
        next(error)
    }
})



module.exports = ordersRouter