const discountCodesRouter = require('express').Router();
const DiscountCode = require("../models/DiscountCode");

discountCodesRouter.get('/', (req, res, next) => {
    DiscountCode.find({})
        .then(discountCodes => {
            res.json({ success: true, data: discountCodes }).status(200).end();
        })
        .catch(err => {
            next(err);
        });
});

discountCodesRouter.get('/id/:id', (req, res, next) => {
    const id = req.params.id;
    DiscountCode.findById(id)
        .then(discountCode => {
            if (discountCode) {
                res.json({ success: true, data: discountCode }).status(200).end();
            } else {
                res.json({ success: false, data: 'Discount code not found' }).status(404).end();
            }
        })
        .catch(err => {
            next(err);
        });
});

discountCodesRouter.get('/code/:code', (req, res, next) => {
    const code = req.params.code;
    DiscountCode.find({ "code": code })
        .then(discountCode => {
            res.json({ success: true, data: discountCode }).status(200).end();
        })
        .catch(err => {
            next(err);
        });
});

module.exports = discountCodesRouter;