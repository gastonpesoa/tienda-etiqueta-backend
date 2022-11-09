const mongoose = require('mongoose')
const { model, Schema } = mongoose
const User = require("../models/User")
const Product = require("../models/Product")
const Billing = require("../models/Billing")
const Card = require("../models/Card")

const OrderSchema = new Schema({
    user: { type: User, required: true },
    billing: { type: Billing, required: true },
    delivery_method: { type: String, required: true },
    payment_method: { type: String, required: true },
    card: { type: Card },
    items: [Product],
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