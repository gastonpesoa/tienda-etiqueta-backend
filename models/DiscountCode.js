const mongoose = require('mongoose')
const { model, Schema } = mongoose

const DiscountCodeSchema = new Schema({
    code: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    used: { type: Boolean, required: true },
    due_date: { type: Date },
    created_by: { type: String, required: true }
});

DiscountCodeSchema.set('toJSON', {
    transform: ((document, discountCodeToJSON) => {
        discountCodeToJSON.id = discountCodeToJSON._id.toString();
        delete discountCodeToJSON._id;
        delete discountCodeToJSON.__v;
    })
});

const DiscountCode = model('DiscountCode', DiscountCodeSchema);

module.exports = DiscountCode;