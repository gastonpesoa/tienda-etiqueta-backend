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
const { calculateTotalCost } = require('../utils/ordersHelper');
const { listenerCount } = require('..')

ordersRouter.use(verifyToken);

ordersRouter.post('/', async (req, res, next) => {
    try {

        const {
            name, last_name, email, address, city, province, postal_code, telephone_number,
            delivery_method, payment_method,
            card_number, titular, due_date, cvc, bank_id, discount_code,
            order_notes, items
        } = req.body;

        let subtotal = 0
        let totalDiscount = 0
        let shippingCost = 0

        const user = req.tokenPayload;
        const userFinded = await User.findById(user.id)

        const productsIds = items.map(item => mongoose.Types.ObjectId(item.product_id))
        const productsFinded = await Product.aggregate([
            { "$project": { price: 1 } },
            { "$match": { "_id": { "$in": productsIds } } }
        ])
        console.log("productsFinded", productsFinded)

        items.forEach(element => {
            let product = productsFinded.find(x => x._id.toString() === element.product_id);
            subtotal += product.price * element.units
        });
        console.log('subtotal', subtotal)
        
        if (bank_id) {
            const bank = await Bank.findById(bank_id)           
            if(bank?.discount_status){
                console.log('bank', bank)
                let percentage = bank.discount / 100
                totalDiscount += subtotal * percentage
            }
        }

        if (discount_code) {
            const discountCode = await DiscountCode.findOne({ "code": discount_code, "used": false })
            if(discountCode){
                console.log('discountCode', discountCode)
                totalDiscount += discountCode.amount
                await DiscountCode.findOneAndUpdate({ "code": discount_code }, { "used": true })
            }
        }
        console.log('totalDiscount', totalDiscount)
        
        if(delivery_method === 'Envío a domicilio'){
            const provinceFinded = await Province.findOne({ "value": province })
            if(provinceFinded){
                shippingCost = provinceFinded.shippingCost
                console.log('shippingCost', shippingCost)
            }
        }
        
        const total = subtotal + shippingCost - totalDiscount
        console.log('total', total)
        
        const billing = new Billing({
            name: name,
            last_name: last_name,
            email: email,
            address: address,
            telephone: telephone_number,
            city: city,
            state: province,
            postal_code: postal_code,
            cost: total
        })

        console.log("billing", billing)
        
        const card = payment_method !== 'cash'
            ? new Card({
                type: payment_method,
                number: card_number,
                titular: titular,
                due_date: due_date,
                cvc: cvc
            })
            : null
            
        console.log("card", card)        
        
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

        console.log("order.billing", order.billing)        
        
        const orderSaved = await order.save(order)
        res.status(201).json({ success: true, data: orderSaved }).end()

    } catch (error) {
        console.log(error)
        next(error)
    }
})



module.exports = ordersRouter