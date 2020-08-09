const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session);
const uuid = require('uuid');
const db = require('./db');


const sessionStore = new MysqlStore({
    clearExpired: true,
    checkExpirationInterval: 60000,
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions'
    }
}, db)
const sessions = session({
    secret: 'networkingNetflix',
    resave: false,
    saveUninitialized: true,
    genid: () => {
        return uuid.v1();
    },
    cookie: {
        // secure: true,
        maxAge: 86400000,

    }
});

// console.log(sessions)
module.exports = session