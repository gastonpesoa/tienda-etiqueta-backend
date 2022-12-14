const mongoose = require('mongoose')
const { Readable } = require('stream');
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../utils/config')
const productsRouter = require('express').Router()
const Product = require("../models/Product")
const User = require("../models/User")
const Order = require("../models/Order")
const Category = require("../models/Category")
const Subcategory = require("../models/Subcategory")

productsRouter.get('/', async (req, res, next) => {
    try {
        let availableProducts = await Product.aggregate([{
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

productsRouter.get('/all', async (req, res, next) => {
    try {
        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin" || userFinded.type === "employee") {
                let products = await Product.aggregate([{
                    $project: {
                        articles: 1, images: 1, title: 1, category: 1, subcategory: 1, description: 1, detail: 1,
                        price: 1, brand: 1, color: 1, gender: 1, rating_average: 1, cut: 1, reviews: 1
                    }
                }])
                if (products) {
                    res.json({ success: true, data: products }).status(200).end()
                } else {
                    res.json({ success: false, data: 'No Products found' }).status(404).end()
                }
            }
        }
    } catch (error) {
        console.log("error", error)
        next(error)
    }
})

productsRouter.get('/image-docs/:id', async (req, res, next) => {
    const id = req.params.id
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'products'
    })
    let docs = []
    const cursor = await bucket.find({ 'metadata.value': id }).toArray()
    cursor.forEach(doc => {
        docs.push(doc)
    });
    res.status(201).json({ success: true, data: docs }).end()
});

productsRouter.get('/image/:id', (req, res) => {
    try {
        var imageId = mongoose.Types.ObjectId(req.params.id)
    } catch (err) {
        return res.status(400).json({ message: "Invalid id in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'products'
    })

    // temporary variable to hold image
    var data = [];

    // create the download stream
    let downloadStream = bucket.openDownloadStream(imageId);
    downloadStream.on('data', (chunk) => {
        data.push(chunk);
    });
    downloadStream.on('error', async (error) => {
        console.log(error)
        next(error)
    });
    downloadStream.on('end', async () => {
        let bufferBase64 = Buffer.concat(data)
        let base64 = Buffer.from(bufferBase64).toString('base64')
        res.status(201).json({ success: true, data: base64 }).end()
    });
});

productsRouter.post('/', async (req, res, next) => {
    try {
        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin" || userFinded.type === "employee") {
                const { title, categoryId, subcategoryId, brand, color, price, gender, description, detail, cut, articles, files } = req.body
                const category = await Category.findById(categoryId);
                const subcategory = await Subcategory.findById(subcategoryId);
                const formatText = text => text.slice(0, 3).padStart(3, '0').toUpperCase();
                for (const article of articles) {
                    let i = 0;
                    let sku, result;
                    do {
                        i++;
                        sku = formatText(category.name) + formatText(brand) + formatText(color) + formatText(article.size) + formatText(i.toString());
                        result = await Product.aggregate([{ $match: { "articles.sku": sku } }])
                    } while (result.length > 0)
                    article.sku = sku;
                };
                const newProduct = await new Product({ title, category, subcategory, description, detail, price, brand, color, gender, cut, articles });
                const productSaved = await newProduct.save();

                const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
                    bucketName: 'products'
                })

                files.map(file => {
                    let buffer = Buffer.from(file.file.split(',')[1], 'base64')
                    const fs = new Readable();
                    fs.push(buffer);
                    fs.push(null);
                    let uploadStream = bucket.openUploadStream(file.fileName, {
                        metadata: { field: 'productId', value: productSaved.id }
                    });
                    fs.pipe(uploadStream)
                })

                res.status(201).json({ success: true, data: { productSaved } }).end()
            }
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

productsRouter.get('/id/:id', async (req, res, next) => {
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

productsRouter.get('/search/:query', async (req, res, next) => {
    const query = req.params.query
    try {
        let queryResult = await Product.aggregate([
            { $match: { $text: { $search: query } } },
            //{ $sort: { score: { $meta: "textScore" } } },
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
        console.log(queryResult)
        if (queryResult) {
            res.json({ success: true, data: queryResult }).status(200).end()
        } else {
            res.json({ success: false, data: 'Not available Products found' }).status(404).end()
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

productsRouter.get('/best-sellers', async (req, res, next) => {
    try {
        let queryResult = await Order.aggregate([
            [
                {
                    $unwind: "$items",
                },
                {
                    $unwind: "$items.product.articles",
                },
                {
                    $group: {
                        _id: "$items.product._id",
                        item: { $first: "$items.product" },
                        ventas: { $sum: 1 },
                    },
                },
                {
                    $sort: {
                        ventas: -1,
                    },
                },
                { $limit: 3 }
            ]
        ])
        console.log(queryResult)
        if (queryResult) {
            res.json({ success: true, data: queryResult }).status(200).end()
        } else {
            res.json({ success: false, data: 'Not available Products found' }).status(404).end()
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

productsRouter.get('/best/:category', async (req, res, next) => {
    const category = req.params.category
    try {
        let queryResult = await Product.aggregate([
            [
                {
                    $match: {
                        "category.url": category,
                        rating_average: { $gt: 0 },
                    }
                },
                {
                    $sort: {
                        rating_average: -1,
                    },
                },
                { $limit: 3 }
            ]
        ])
        console.log(queryResult)
        if (queryResult) {
            res.json({ success: true, data: queryResult }).status(200).end()
        } else {
            res.json({ success: false, data: 'Not available Products found' }).status(404).end()
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

productsRouter.get('/best-rated', async (req, res, next) => {
    const category = req.params.category
    try {
        let queryResult = await Product.aggregate([
            [
                { $match: { rating_average: { $gt: 0 } } },
                { $sort: { rating_average: -1 } }
            ]
        ])
        if (queryResult) {
            res.json({ success: true, data: queryResult }).status(200).end()
        } else {
            res.json({ success: false, data: 'Not available Products found' }).status(404).end()
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})


productsRouter.put('/review', async (req, res, next) => {
    const bearerToken = req.headers['authorization']
    const { opinion, rate, product_id, order_id } = req.body;
    if (typeof bearerToken !== 'undefined') {
        try {
            req.token = bearerToken.split(' ')[1]
            const user = await jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(mongoose.Types.ObjectId(user.id))
            let productFinded = await Product.findById(mongoose.Types.ObjectId(product_id))
            let orderFinded = await Order.findById(mongoose.Types.ObjectId(order_id))
            if (!productFinded || !orderFinded || productFinded.reviews.some(review => review.user_id === user.id)) {
                next({ name: "ValidationError", message: "Operaci??n inv??lida" })
            } else {
                if (!productFinded.reviews) {
                    productFinded.reviews = []
                }
                const newReview = { date: Date.now(), review: opinion, rating: rate, user_id: user.id }
                productFinded.reviews.push(newReview)
                const ratingAverage = productFinded.reviews.reduce((total, next) => total + next.rating, 0) / productFinded.reviews.length;
                productFinded.rating_average = ratingAverage
                orderFinded.items.map(item => {
                    if (item.product._id.toString() === product_id) {
                        if (!item.product.reviews) {
                            item.product.reviews = []
                        }
                        item.product.reviews.push(newReview)
                        item.product.rating_average = ratingAverage
                    }
                })
                productFinded.save()
                orderFinded.save()
                res.json({ success: true, data: orderFinded }).status(200).end()
            }
        }
        catch (error) {
            next(error)
        }
    }
    else {
        next({ name: "ErrorToken", message: "No token" })
    }
});

productsRouter.put('/id/:id', async (req, res, next) => {
    const { id } = req.params;
    const { title, categoryId, subcategoryId, brand, color, price, gender, description, detail, cut, articles, files } = req.body;
    try {
        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin" || userFinded.type === "employee") {

                if (files.length > 0) {

                    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
                        bucketName: 'products'
                    })

                    const cursor = await bucket.find({ 'metadata.value': id }).toArray()
                    cursor.forEach(doc => {
                        bucket.delete(doc._id, (err, result) => {
                            if (err) {
                                console.log("delete error", err)
                            } else {
                                console.log("delete result", result)
                            }
                        })
                    })

                    files.map(file => {
                        let buffer = Buffer.from(file.file.split(',')[1], 'base64')
                        const fs = new Readable();
                        fs.push(buffer);
                        fs.push(null);
                        let uploadStream = bucket.openUploadStream(file.fileName, {
                            metadata: { field: 'productId', value: id }
                        });
                        fs.pipe(uploadStream)
                    })
                }

                const category = await Category.findById(categoryId);
                const subcategory = await Subcategory.findById(subcategoryId);
                const formatText = text => text.slice(0, 3).padStart(3, '0').toUpperCase();
                for (const article of articles) {
                    let i = 0;
                    let sku, result;
                    do {
                        i++;
                        sku = formatText(category.name) + formatText(brand) + formatText(color) + formatText(article.size) + formatText(i.toString());
                        result = await Product.aggregate([{ $match: { "articles.sku": sku } }])
                        console.log(result);
                    } while (result.length > 0 && result._id != undefined && result._id.toString() != id)
                    article.sku = sku;
                };
                const productToEdit = { title, category, subcategory, description, detail, price, brand, color, gender, cut, articles };
                Product.findByIdAndUpdate(id, productToEdit, { new: true })
                    .then((product) => {
                        product ? res.status(200).json(product) : res.status(404).end();
                    })
                    .catch(err => {
                        next(err);
                    });
            }
        }
    } catch (error) {
        console.log(error)
        next(error);
    }
});

productsRouter.delete("/id/:id", async (req, res, next) => {
    const { id } = req.params;

    try {
        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin" || userFinded.type === "employee") {

                const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
                    bucketName: 'products'
                })

                const cursor = await bucket.find({ 'metadata.value': id }).toArray()
                cursor.forEach(doc => {
                    bucket.delete(doc._id, (err, result) => {
                        if (err) {
                            console.log("delete error", err)
                        } else {
                            console.log("delete result", result)
                        }
                    })
                })

                Product.findByIdAndRemove(id)
                    .then((obj) => {
                        obj ? res.status(200).json(obj) : res.status(404).end();
                    })
                    .catch((err) => {
                        next(err);
                    });
            }
        }
    } catch (error) {
        console.log(error)
        next(error);
    }
});

module.exports = productsRouter