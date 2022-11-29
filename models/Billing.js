const mongoose = require('mongoose')
const DiscountCode = require("../models/DiscountCode")
const Bank = require("../models/Bank")
const { model, Schema } = mongoose

const BillingSchema = new Schema({
    name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    telephone: { type: Number, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postal_code: { type: Number, required: true },
    discount_code: { type: DiscountCode.schema },
    discount_bank: { type: Bank.schema },
    discount_bank_amount: { type: Number },
    total_discounts: { type: Number },
    subtotal_cost: { type: Number, required: true },
    shipping_cost: { type: Number },
    total_cost: { type: Number, required: true }
})

BillingSchema.set('toJSON', {
    transform: ((document, billingToJSON) => {
        billingToJSON.id = billingToJSON._id.toString()
        delete billingToJSON._id
        delete billingToJSON.__v
    })
})

const Billing = model('Billing', BillingSchema)

module.exports = Billing