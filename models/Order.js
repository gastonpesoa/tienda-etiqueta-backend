const mongoose = require('mongoose')
const { model, Schema } = mongoose
const User = require("../models/User")
const Product = require("../models/Product")
const Billing = require("../models/Billing")
const Card = require("../models/Card")

const OrderSchema = new Schema({
    date: { type: Date, required: true },
    last_update_date: { type: Date, required: true },
    user: { type: User.schema, required: true },
    billing: { type: Billing.schema, required: true },
    delivery_method: { type: String, required: true },
    payment_method: { type: String, required: true },
    card: { type: Card.schema },
    items: [{
        product: { type: Product.schema, required: true },
        units: { type: Number, required: true },
        size: { type: String, required: true }
    }],
    order_notes: { type: String },
    state: { type: String, required: true }
})

OrderSchema.set('toJSON', {
    transform: ((document, orderToJSON) => {
        orderToJSON.id = orderToJSON._id.toString()
        delete orderToJSON._id
        delete orderToJSON.__v
    })
})

const Order = model('Order', OrderSchema)

module.exports = Order