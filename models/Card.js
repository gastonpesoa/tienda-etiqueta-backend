const mongoose = require('mongoose')
const { model, Schema } = mongoose

const CardSchema = new Schema({
    type: { type: String, required: true },
    number: { type: Number, required: true },
    titular: { type: String, required: true },
    due_date: { type: String, required: true },
    cvc: { type: Number, required: true }
})

CardSchema.set('toJSON', {
    transform: ((document, cardToJSON) => {
        cardToJSON.id = cardToJSON._id.toString()
        delete cardToJSON._id
        delete cardToJSON.__v
        delete cardToJSON.passwordHash
    })
})

const Card = model('Card', CardSchema)

module.exports = Card