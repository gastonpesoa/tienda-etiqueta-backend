const mongoose = require('mongoose')
const Category = require('./Category')
const { model, Schema } = mongoose

const SubcategorySchema = new Schema({
    category: { type: Category.schema, required: true },
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        //required: true
    }
})

SubcategorySchema.set('toJSON', {
    transform: ((document, subcategoryToJSON) => {
        subcategoryToJSON.id = subcategoryToJSON._id.toString()
        delete subcategoryToJSON._id
        delete subcategoryToJSON.__v
    })
})

const Subcategory = model('Subcategory', SubcategorySchema)

module.exports = Subcategory