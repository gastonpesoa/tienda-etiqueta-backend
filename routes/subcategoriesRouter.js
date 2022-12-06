const subcategoriesRouter = require('express').Router();
const Subcategory = require("../models/Subcategory");

subcategoriesRouter.get('/', (req, res, next) => {
    Subcategory.find({})
        .then(objs => {
            res.json({ success: true, data: objs }).status(200).end();
        })
        .catch(err => {
            next(err);
        });
});

// Traer una subcategoría por ID
subcategoriesRouter.get('/id/:id', (req, res, next) => {
    const id = req.params.id;
    Subcategory.findById(id)
        .then(obj => {
            if (obj) {
                res.json({ success: true, data: obj }).status(200).end();
            } else {
                res.json({ success: false, data: 'Subcategory not found' }).status(404).end();
            }
        })
        .catch(err => {
            next(err);
        });
});

// Agrega una subcategoría
/*subcategoriesRouter.post('/', (req, res, next) => {
    const { name } = req.body;
    const newCategory = new Category({ name });
        
    newCategory.save()
    .then((obj) => {
        obj ? res.status(201).send(obj) : res.status(400).send();
    })
    .catch((err) => {
        next(err);
    });
});*/

// Actualiza una subcategoría
/*subcategoriesRouter.put('/id/:id', (req, res, next) => {
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
});*/

// Elimina una subcategoría
subcategoriesRouter.delete("/id/:id", (req, res, next) => {
    const { id } = req.params;
  
    Subcategory.findByIdAndRemove(id)
    .then((obj) => {
        obj ? res.status(200).json(obj) : res.status(404).end();
    })
    .catch((err) => {
        next(err);
    });
});

module.exports = subcategoriesRouter;