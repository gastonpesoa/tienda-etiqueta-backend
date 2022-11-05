const productsRouter = require('express').Router()
const Product = require("../models/Product")

productsRouter.get('/', (req, res, next) => {
    Product.find({})
        .then(products => {
            res.json({ success: true, data: products }).status(200).end()
        })
        .catch(err => {
            next(err)
        })
})

productsRouter.get('/:id', (req, res, next) => {
    const id = req.params.id
    Product.findById(id)
        .then(product => {
            if (product) {
                res.json({ success: true, data: product }).status(200).end()
            } else {
                res.json({ success: false, data: 'Product not found' }).status(404).end()
            }
        })
        .catch(err => {
            next(err)
        })
})

productsRouter.get('/:category', (req, res, next) => {
    const category = req.params.category
    Product.find({ "category": category })
        .then(products => {
            res.json({ success: true, data: products }).status(200).end()
        })
        .catch(err => {
            next(err)
        })
})

module.exports = productsRouter