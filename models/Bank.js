const mongoose = require('mongoose')
const { model, Schema } = mongoose

const BankSchema = new Schema({
    bank: { type: String, required: true, unique: true },
    discount: { type: Number, required: true, max: 100, min: 0 },
    discount_status: { type: Boolean, required: true },
});

BankSchema.set('toJSON', {
    transform: ((document, bankToJSON) => {
        bankToJSON.id = bankToJSON._id.toString();
        delete bankToJSON._id;
        delete bankToJSON.__v;
    })
});

const Bank = model('Bank', BankSchema);

module.exports = Bank;