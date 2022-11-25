const mongoose = require('mongoose')
const { model, Schema } = mongoose

const ProvinceSchema = new Schema({
    value: { type: String, required: true },
    shippingCost: { type: Number, required: true }
})

ProvinceSchema.set('toJSON', {
    transform: ((document, provinceToJSON) => {
        provinceToJSON.id = provinceToJSON._id.toString()
        delete provinceToJSON._id
        delete provinceToJSON.__v
    })
})

const Province = model('Province', ProvinceSchema)

module.exports = Province