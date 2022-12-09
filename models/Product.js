const mongoose = require('mongoose')
const Category = require('./Category')
const Subcategory = require('./Subcategory')
const { model, Schema } = mongoose

const ProductSchema = new Schema({
    images: [String],
    title: { type: String, required: true },
    category: {
        type: Category.schema, 
        required: true
    },
    subcategory: { type: Subcategory.schema },
    description: { type: String, required: true },
    detail: { type: String, required: true },
    price: { type: Number, required: true },
    brand: { type: String, required: true },
    color: { type: String, required: true },
    gender: { type: String, required: true },
    rating_average: { type: Number },
    cut: { type: String },
    articles: [
        new Schema({
            sku: String,
            stock: Number,
            size: String
        })
    ],
    reviews: [
        new Schema({
            rating: Number,
            review: String,
            user_id: String,
            date: Date,
        })
    ]
})

ProductSchema.set('toJSON', {
    transform: ((document, productToJSON) => {
        productToJSON.id = productToJSON._id.toString()
        delete productToJSON._id
        delete productToJSON.__v
    })
})

const Product = model('Product', ProductSchema)

module.exports = Product