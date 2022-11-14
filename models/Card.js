const mongoose = require('mongoose')
const { model, Schema } = mongoose

const CardSchema = new Schema({
    type: { type: String },
    number: { type: Number },
    titular: { type: String },
    due_date: { type: String },
    cvc: { type: Number }
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