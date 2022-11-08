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

// Traer un código por ID
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

// Verificar si un código existe y no se encuentra usado
discountCodesRouter.get('/code/:code', (req, res, next) => {
    const code = req.params.code;
    DiscountCode.find({ "code": code, "used": false })
        .then(discountCode => {
            res.json({ success: true, data: discountCode }).status(200).end();
        })
        .catch(err => {
            next(err);
        });
});

// Marca un código como usado
discountCodesRouter.put('/code/:code', (req, res, next) => {
    const { code } = req.params;
    const discountCodeToEdit = { code };
  
    DiscountCode.findByIdAndUpdate(id, discountCodeToEdit, { new: false })
    .then((discountCode) => {
        discountCode ? res.status(200).json(discountCode) : res.status(404).end();
    })
    .catch(err => {
        next(err);
    });
});

// Agrega un código
discountCodesRouter.post('/', (req, res, next) => {
    const { code, amount, used, due_date, created_by } = req.body;
    const newDiscountCode = new DiscountCode({ code, amount, used, due_date, created_by });
        
    newDiscountCode.save()
    .then((discountCode) => {
        discountCode ? res.status(201).send(discountCode) : res.status(400).send();
    })
    .catch((err) => {
        next(err);
    });
});

// Actualiza un código
discountCodesRouter.put('/id/:id', (req, res, next) => {
    const { id } = req.params;
    const { code, amount, used, due_date, created_by } = req.body;
    const discountCodeToEdit = { code, amount, used, due_date, created_by };
  
    DiscountCode.findByIdAndUpdate(id, discountCodeToEdit, { new: true })
    .then((discountCode) => {
        discountCode ? res.status(200).json(discountCode) : res.status(404).end();
    })
    .catch(err => {
        next(err);
    });
});

module.exports = discountCodesRouter;