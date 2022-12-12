const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../utils/config')
const { Readable } = require('stream');
const carouselRouter = require('express').Router();
const User = require("../models/User");

function checkBase64(string) {
    const B64_REGEX = /^data:.*;base64,([0-9a-zA-Z+\\/]{4})*(([0-9a-zA-Z+\\/]{2}==)|([0-9a-zA-Z+\\/]{3}=))?$/i
    return B64_REGEX.test(string)
}

carouselRouter.get('/', async (req, res, next) => {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'carousel'
    })
    let docs = []
    const cursor = await bucket.find({}).toArray()
    cursor.forEach(doc => {
        docs.push(doc)
    });
    res.status(201).json({ success: true, data: docs }).end()
});

carouselRouter.get('/id/:id', (req, res) => {
    try {
        var imageId = mongoose.Types.ObjectId(req.params.id)
    } catch (err) {
        return res.status(400).json({ message: "Invalid id in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'carousel'
    })

    // temporary variable to hold image
    var data = [];

    // create the download stream
    let downloadStream = bucket.openDownloadStream(imageId);
    downloadStream.on('data', (chunk) => {
        data.push(chunk);
    });
    downloadStream.on('error', async (error) => {
        reject(error);
    });
    downloadStream.on('end', async () => {
        let bufferBase64 = Buffer.concat(data)
        let base64 = Buffer.from(bufferBase64).toString('base64')
        res.status(201).json({ success: true, data: base64 }).end()
    });
});

carouselRouter.post('/', async (req, res, next) => {
    try {
        const { fileName, file, urlAction } = req.body

        const bearerToken = req.headers['authorization']
        if (typeof bearerToken === 'undefined') {
            next({ name: "ErrorToken", message: "No token" })
        } else {
            req.token = bearerToken.split(' ')[1]
            const userData = jwt.verify(req.token, PRIVATE_KEY)
            const userFinded = await User.findById(userData.id)
            if (userFinded.type === "admin" || userFinded.type === "employee") {

                const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
                    bucketName: 'carousel'
                })

                // if (checkBase64(file)) {
                // }

                let buffer = Buffer.from(file.split(',')[1], 'base64')
                const fs = new Readable();
                fs.push(buffer);
                fs.push(null);
                let uploadStream = bucket.openUploadStream(fileName, {
                    metadata: { field: 'urlAction', value: urlAction }
                });
                fs.pipe(uploadStream)

                res.status(201).json({ success: true }).end()
            }
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})


carouselRouter.delete('/:id', async (req, res, next) => {
    const id = req.params.id
    const bearerToken = req.headers['authorization']
    if (typeof bearerToken === 'undefined') {
        next({ name: "ErrorToken", message: "No token" })
    } else {
        req.token = bearerToken.split(' ')[1]
        const userData = jwt.verify(req.token, PRIVATE_KEY)
        const userFinded = await User.findById(userData.id)
        if (userFinded.type === "admin" || userFinded.type === "employee") {
            // Province.findByIdAndRemove(id)
            //     .then(province => {
            //         if (province) {
            //             res.json({ success: true, data: province }).status(204).end()
            //         } else {
            //             res.json({ success: false, data: 'Province not found' }).status(404).end()
            //         }
            //     })
            //     .catch(err => {
            //         next(err)
            //     })
        }
    }
})

module.exports = carouselRouter;