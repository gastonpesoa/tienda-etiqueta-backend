const categoriesRouter = require('express').Router();
const Category = require("../models/Category");

categoriesRouter.get('/', (req, res, next) => {
    Category.find({})
        .then(objs => {
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
categoriesRouter.post('/', (req, res, next) => {
    const { name } = req.body;
    const newCategory = new Category({ name });
        
    newCategory.save()
    .then((obj) => {
        obj ? res.status(201).send(obj) : res.status(400).send();
    })
    .catch((err) => {
        next(err);
    });
});

// Actualiza una categoría
categoriesRouter.put('/id/:id', (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;
    const categoryToEdit = { name };
  
    Category.findByIdAndUpdate(id, categoryToEdit, { new: true })
    .then((obj) => {
        obj ? res.status(200).json(obj) : res.status(404).end();
    })
    .catch(err => {
        next(err);
    });
});

// Elimina una categoría
categoriesRouter.delete("/id/:id", (req, res, next) => {
    const { id } = req.params;
  
    Category.findByIdAndRemove(id)
    .then((obj) => {
        obj ? res.status(200).json(obj) : res.status(404).end();
    })
    .catch((err) => {
        next(err);
    });
});

module.exports = categoriesRouter;