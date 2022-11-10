const config = require('../../../config/database')
const mysql = require('mysql2')

const pool = mysql.createConnection({
    host: config.host ? config.host : '127.0.0.1',
    port: config.port ? config.port : '3306',
    user: config.user,
    database: config.database,
    password: config.password
})

module.exports = pool.promise()