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

productsRouter.get('/id/:id', (req, res, next) => {
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

productsRouter.get('/category/:category', (req, res, next) => {
    const category = req.params.category    
    Product.find({ "category.url": category })
        .then(products => {
            res.json({ success: true, data: products }).status(200).end()
        })
        .catch(err => {
            next(err)
        })
})

productsRouter.get('/category/:category/subcategory/:subcategory', (req, res, next) => {
    const category = req.params.category
    const subcategory = req.params.subcategory
    console.log("category", category)
    console.log("subcategory", subcategory)
    Product.find({ "category.url": category, "subcategory.url": subcategory })
        .then(products => {
            res.json({ success: true, data: products }).status(200).end()
        })
        .catch(err => {
            next(err)
        })
})

module.exports = productsRouter