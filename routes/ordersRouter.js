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

ordersRouter.get('/:id', (req, res, next) => {
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

        const productsIds = items.map(item => mongoose.Types.ObjectId(item.product_id))
        const productsFinded = await Product.aggregate([
            { "$match": { "_id": { "$in": productsIds } } }
        ])
        console.log("productsFinded", productsFinded)

        items.forEach(element => {
            let product = productsFinded.find(x => x._id.toString() === element.product_id);
            subtotalCost += product.price * element.units
            products.push({ product: product, units: element.units, size: element.size })
        });
        totalCost = subtotalCost
        console.log('subtotal', subtotalCost)

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
                console.log('bankFinded', bankFinded)
                bank = bankFinded
                billing.discount_bank = bankFinded.bank
                let discountBankAmount = subtotalCost * (bankFinded.discount / 100)
                billing.discount_bank_amount = discountBankAmount
                totalCost -= discountBankAmount
            }
        }

        if (discount_code) {
            const discountCodeFinded = await DiscountCode.findOne({ "code": discount_code, "used": false })
            if (discountCodeFinded) {
                console.log('discountCodeFinded', discountCodeFinded)
                billing.discount_code = discountCodeFinded.code
                billing.discount_code_amount = discountCodeFinded.amount
                totalCost -= discountCodeFinded.amount
                await DiscountCode.findOneAndUpdate({ "code": discountCodeFinded.code }, { "used": true })
            }
        }

        if (delivery_method === 'Envío a domicilio') {
            const provinceFinded = await Province.findOne({ "value": province })
            if (provinceFinded) {
                shippingCost = provinceFinded.shippingCost
                billing.shipping_cost = shippingCost
                totalCost += shippingCost
                console.log('shippingCost', shippingCost)
            }
        }

        billing.total_cost = totalCost
        console.log("billing", billing)

        console.log("payment_method", payment_method)
        const card = payment_method === 'Tarjeta de crédito'
            ? new Card({
                type: bank?.bank,
                number: card_number,
                titular: titular,
                due_date: due_date,
                cvc: cvc
            })
            : null
        console.log("card", card)

        const order = new Order({
            date: Date.now(),
            last_update_date: Date.now(),
            user: userFinded,
            billing: billing,
            delivery_method: delivery_method,
            payment_method: payment_method,
            card: card,
            items: products,
            order_notes: order_notes,
            state: 'CONFIRMADA'
        })
        console.log("order", order)

        const orderSaved = await order.save(order)
        res.status(201).json({ success: true, data: orderSaved }).end()

    } catch (error) {
        console.log(error)
        next(error)
    }
})

module.exports = ordersRouter