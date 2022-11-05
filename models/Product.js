const mongoose = require('mongoose')
const { model, Schema } = mongoose

const productSchema = new Schema({
    images: [String],
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    brand: { type: String, required: true },
    color: { type: String, required: true },
    rating_average: { type: Number },
    stock: { type: Number, required: true },
    cut: { type: String },
    sizes: [String],
    reviews: [
        new Schema({
            rating: Number,
            review: String
        })
    ]

})

productSchema.set('toJSON', {
    transform: ((document, productToJSON) => {
        productToJSON.id = productToJSON._id.toString()
        delete productToJSON._id
        delete productToJSON.__v
    })
})

const Product = model('Product', productSchema)

module.exports = Product