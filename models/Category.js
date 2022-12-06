const mongoose = require('mongoose')
const { model, Schema } = mongoose

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
})

CategorySchema.set('toJSON', {
    transform: ((document, categoryToJSON) => {
        categoryToJSON.id = categoryToJSON._id.toString()
        delete categoryToJSON._id
        delete categoryToJSON.__v
    })
})

const Category = model('Category', CategorySchema)

module.exports = Category