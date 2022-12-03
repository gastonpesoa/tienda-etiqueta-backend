const mongoose = require('mongoose')
const productsRouter = require('express').Router()
const Product = require("../models/Product")

productsRouter.get('/', async (req, res, next) => {
    try {
        let availableProducts = await Product.aggregate([
            {
                $project: {
                    articles: {
                        $filter: {
                            input: "$articles",
                            as: "article",
                            cond: { $gt: ["$$article.stock", 0] }
                        }
                    },
                    images: 1, title: 1, category: 1, subcategory: 1, description: 1, detail: 1,
                    price: 1, brand: 1, color: 1, gender: 1, rating_average: 1, cut: 1, reviews: 1
                }
            }
        ])
        if (availableProducts) {
            res.json({ success: true, data: availableProducts }).status(200).end()
        } else {
            res.json({ success: false, data: 'Not available Products found' }).status(404).end()
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.get('/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        let product = await Product.aggregate([
            { $match: { "_id": mongoose.Types.ObjectId(id) } },
            {
                $project: {
                    articles: {
                        $filter: {
                            input: "$articles",
                            as: "article",
                            cond: { $gt: ["$$article.stock", 0] }
                        }
                    },
                    images: 1, title: 1, category: 1, subcategory: 1, description: 1, detail: 1,
                    price: 1, brand: 1, color: 1, gender: 1, rating_average: 1, cut: 1, reviews: 1
                }
            }
        ])
        if (product) {
            res.json({ success: true, data: product[0] }).status(200).end()
        } else {
            res.json({ success: false, data: 'Product not found' }).status(404).end()
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.get('/category/:category', async (req, res, next) => {
    const category = req.params.category
    try {
        let availableProducts = await Product.aggregate([
            { $match: { "category.url": category } },
            {
                $project: {
                    articles: {
                        $filter: {
                            input: "$articles",
                            as: "article",
                            cond: { $gt: ["$$article.stock", 0] }
                        }
                    },
                    images: 1, title: 1, category: 1, subcategory: 1, description: 1, detail: 1,
                    price: 1, brand: 1, color: 1, gender: 1, rating_average: 1, cut: 1, reviews: 1
                }
            }
        ])
        if (availableProducts) {
            res.json({ success: true, data: availableProducts }).status(200).end()
        } else {
            res.json({ success: false, data: 'Not available Products found' }).status(404).end()
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.get('/category/:category/subcategory/:subcategory', async (req, res, next) => {
    const category = req.params.category
    const subcategory = req.params.subcategory
    console.log("category", category)
    console.log("subcategory", subcategory)
    try {
        let availableProducts = await Product.aggregate([
            { $match: { "category.url": category, "subcategory.url": subcategory } },
            {
                $project: {
                    articles: {
                        $filter: {
                            input: "$articles",
                            as: "article",
                            cond: { $gt: ["$$article.stock", 0] }
                        }
                    },
                    images: 1, title: 1, category: 1, subcategory: 1, description: 1, detail: 1,
                    price: 1, brand: 1, color: 1, gender: 1, rating_average: 1, cut: 1, reviews: 1
                }
            }
        ])
        if (availableProducts) {
            res.json({ success: true, data: availableProducts }).status(200).end()
        } else {
            res.json({ success: false, data: 'Not available Products found' }).status(404).end()
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.put('/review', async (req, res, next) => {
    const { opinion, rate, product_id } = req.body;
    try {
        let productFinded = await Product.findById(mongoose.Types.ObjectId(product_id))
        if (productFinded) {
            console.log("productFinded", productFinded)
            let reviews = productFinded.reviews
            reviews.push({ date: Date.now(), review: opinion, rating: rate })
            console.log("reviews updated", reviews)
            let updateResult = await Product.findByIdAndUpdate(productFinded.id, { "reviews": reviews })
            res.json({ success: true, data: updateResult }).status(200).end()
        }
    } catch (error) {
        next(error)
    }
});

module.exports = productsRouter