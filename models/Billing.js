const mongoose = require('mongoose')
const { model, Schema } = mongoose

const BillingSchema = new Schema({
    name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    telephone: { type: Number, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal_code: { type: Number, required: true },
    cost: { type: Number, required: true },
    shipping_cost: { type: Number, required: true }
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