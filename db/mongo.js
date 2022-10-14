const { connect } = require('mongoose')
const { DB_URI } = require('../utils/config')

const connectDb = async () => {
    connect(DB_URI)
}

connectDb()
    .then(result => console.log("Db connected"))
    .catch(err => console.log(err))