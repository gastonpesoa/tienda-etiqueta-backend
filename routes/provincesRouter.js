const provincesRouter = require('express').Router();
const Province = require("../models/Province");

provincesRouter.get('/', (req, res, next) => {
    Province.find({})
        .then(objs => {
            res.json({ success: true, data: objs }).status(200).end();
        })
        .catch(err => {
            next(err);
        });
});

module.exports = provincesRouter;