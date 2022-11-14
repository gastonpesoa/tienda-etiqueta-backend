const banksRouter = require('express').Router();
const Bank = require("../models/Bank");

banksRouter.get('/', (req, res, next) => {
    Bank.find({})
        .then(objs => {
            res.json({ success: true, data: objs }).status(200).end();
        })
        .catch(err => {
            next(err);
        });
});

// Trae bancos con promociones vigentes
banksRouter.get('/valid/', (req, res, next) => {
    Bank.find({ "discount_status": true })
        .then(objs => {
            res.json({ success: true, data: objs }).status(200).end();
        })
        .catch(err => {
            next(err);
        });
});

// Traer un banco por ID
banksRouter.get('/id/:id', (req, res, next) => {
    const id = req.params.id;
    Bank.findById(id)
        .then(obj => {
            if (obj) {
                res.json({ success: true, data: obj }).status(200).end();
            } else {
                res.json({ success: false, data: 'Bank not found' }).status(404).end();
            }
        })
        .catch(err => {
            next(err);
        });
});

// Agrega un banco
banksRouter.post('/', (req, res, next) => {
    const { bank, discount, discount_status } = req.body;
    const newBank = new Bank({ bank, discount, discount_status });
        
    newBank.save()
    .then((obj) => {
        obj ? res.status(201).send(obj) : res.status(400).send();
    })
    .catch((err) => {
        next(err);
    });
});

// Actualiza un banco
banksRouter.put('/id/:id', (req, res, next) => {
    const { id } = req.params;
    const { bank, discount, discount_status } = req.body;
    const bankToEdit = { bank, discount, discount_status };
  
    Bank.findByIdAndUpdate(id, bankToEdit, { new: true })
    .then((obj) => {
        obj ? res.status(200).json(obj) : res.status(404).end();
    })
    .catch(err => {
        next(err);
    });
});

// Elimina un banco
banksRouter.delete("/id/:id", (req, res, next) => {
    const { id } = req.params;
  
    Bank.findByIdAndRemove(id)
    .then((obj) => {
        obj ? res.status(200).json(obj) : res.status(404).end();
    })
    .catch((err) => {
        next(err);
    });
});

module.exports = banksRouter;