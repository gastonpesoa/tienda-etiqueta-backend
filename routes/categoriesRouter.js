const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../utils/config')
const categoriesRouter = require('express').Router();
const Category = require("../models/Category");
const User = require("../models/User");
const Subcategory = require('../models/Subcategory');
const Product = require('../models/Product');

categoriesRouter.get('/', (req, res, next) => {
    Category.find({})
        .then(objs => {
            res.json({ success: true, data: objs }).status(200).end();
        })
        .catch(err => {
            next(err);
        });
});

categoriesRouter.get('/subcategories', async (req, res, next) => {
    Category.aggregate([{ $match: {} }, { $project: { _id: 1, name: 1, url: 1 } }])
        .then(async objs => {
            if (objs.length > 0) {
                for (cat of objs) {
                    let subcategories = await Subcategory.find({ "category._id": cat._id })
                    let newArray = [];
                    await subcategories.map(subcat => {
                        newArray.push({
                            key: subcat._id,
                            title: subcat.name,
                            link: `/products/${cat.url}/${subcat.url}`
                        })
                    })
                    cat.items = []
                    cat.items.push(...newArray);
                }
                
            }
            res.json({ success: true, data: objs }).status(200).end();   
        })
        .catch(err => {
            next(err);
        });
});

// Traer una categoría por ID
categoriesRouter.get('/id/:id', (req, res, next) => {
    const id = req.params.id;
    Category.findById(id)
        .then(obj => {
            if (obj) {
                res.json({ success: true, data: obj }).status(200).end();
            } else {
                res.json({ success: false, data: 'Category not found' }).status(404).end();
            }
        })
        .catch(err => {
            next(err);
        });
});

// Agrega una categoría
categoriesRouter.post('/', async (req, res, next) => {
    try {
        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin") {
                const { name, url } = req.body;
                const newCategory = new Category({ name, url });
                    
                newCategory.save()
                .then((obj) => {
                    obj ? res.status(201).send(obj) : res.status(400).send();
                })
                .catch((err) => {
                    next(err);
                });
            }
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
});

// Actualiza una categoría
categoriesRouter.put('/id/:id', async (req, res, next) => {
    try {
        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin") {
                const { id } = req.params;
                const { name, url } = req.body;
                const categoryToEdit = { name, url };
            
                Category.findByIdAndUpdate(id, categoryToEdit, { new: true })
                .then((obj) => {
                    obj ? res.status(200).json(obj) : res.status(404).end();
                })
                .catch(err => {
                    next(err);
                });
            }
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
});

// Elimina una categoría
categoriesRouter.delete("/id/:id", async (req, res, next) => {
    try {
        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin") {
                const { id } = req.params;
                const category = await Category.findById(id);
                const resultSubcategories = await Subcategory.aggregate([{ $match: { "category._id": category._id } }]);
                const resultProducts = await Product.aggregate([{ $match: { "category._id": category._id } }]);

                if (resultSubcategories.length > 0) {
                    res.status(409).json({ message: 'La categoría no puede ser eliminada porque actualmente contiene sub-categorías' })
                } else if (resultProducts.length > 0) {
                    res.status(409).json({ message: 'La categoría no puede ser eliminada porque actualmente contiene artículos' })
                } else {
                    Category.findByIdAndRemove(id)
                    .then((obj) => {
                        obj ? res.status(200).json(obj) : res.status(404).json({ message: 'Categoría no encontrada' });
                    })
                    .catch((err) => {
                        next(err);
                    });
                }
            }
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
});

module.exports = categoriesRouter;