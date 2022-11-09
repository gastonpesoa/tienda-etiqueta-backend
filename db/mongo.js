const { connect } = require('mongoose')
const { MONGODB_URI } = require('../utils/config')

const connectDb = async () => {
    connect(MONGODB_URI)
}

connectDb()
    .then(result => console.log("Db connected"))
    .catch(err => console.log(err))