const mongoose = require('mongoose')
const { model, Schema } = mongoose

const UserSchema = new Schema({
    name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postal_code: { type: Number, required: true },
    telephone: { type: Number },
    password_hash: { type: String, required: true }
})

UserSchema.set('toJSON', {
    transform: ((document, userToJSON) => {
        userToJSON.id = userToJSON._id.toString()
        delete userToJSON._id
        delete userToJSON.__v
        delete userToJSON.passwordHash
    })
})

const User = model('User', UserSchema)

module.exports = User