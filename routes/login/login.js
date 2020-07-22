const express = require('express');
const login = express.Router()
const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session);
const bcrypt = require('bcrypt');
const db = require('../db');
const uuid = require('uuid').v1;
// login.use(session)
const sessionStore = new MysqlStore({
    clearExpired: true,
    checkExpirationInterval: 60000,
    createDatabaseTable: true,
    schema:{
        tableName: 'sessions'
    }
}, db)
login.use(session({
    secret: 'networkingNetflix',
    resave: false,
    saveUninitialized: true,
    genid:()=>{
        return uuid();
    },
    cookie: {
        // secure: true,
        maxAge: 86400000,
        
    }
}))

login.get('/login', (req, res)=>{
    if(req.session.username){
        // console.log(req.session)
        res.redirect('/dashboard')
    }else{
            res.render('login');

    }
})

login.post('/login', (req, res)=>{
    const data = req.body;
    const values = [data.username, data.username]
    const sql = `select * from registered_users where username = ? or email = ?`;
    db.query(sql, values, (err, result)=>{
        if(err)throw err;
        if(result.length === 1){
            req.session.username = data.username
            result = result[0]
            bcrypt.compare(data.password, result.password).then( password =>{
                if(password){
                    // console.log('welcome')
                    res.redirect('/dashboard')

                }else{
                    console.log('wrong password')//re render page with wrong password message
                }
            })
        }else{
            console.log('invalid username')// invalid username... re render the page with an error message
        }
    })
})


module.exports = login