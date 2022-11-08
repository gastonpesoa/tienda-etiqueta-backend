const mongoose = require('mongoose')
const { model, Schema } = mongoose

const DiscountCodeSchema = new Schema({
    code: { type: String },
    amount: { type: Number },
    used: { type: Boolean },
    due_date: { type: Date },
    created_by: { type: String }
});

DiscountCodeSchema.set('toJSON', {
    transform: ((document, discountCodeToJSON) => {
        discountCodeToJSON.id = discountCodeToJSON._id.toString()
        delete discountCodeToJSON._id
        delete discountCodeToJSON.__v
    })
});

const DiscountCode = model('DiscountCode', DiscountCodeSchema);

module.exports = DiscountCode;