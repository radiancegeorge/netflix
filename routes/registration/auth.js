const express = require('express');
const auth = express.Router();
const db = require('../db')
const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session);
const uuid = require('uuid').v1;

const sessionStore = new MysqlStore({
    clearExpired: true,
    checkExpirationInterval: 60000,
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions'
    }
}, db)
auth.use(session({
    secret: 'networkingNetflix',
    resave: false,
    saveUninitialized: true,
    genid: () => {
        return uuid();
    },
    cookie: {
        // secure: true,
        maxAge: 86400000,

    }
}))

auth.get('/auth/:id', (req, res)=>{
    console.log(req.session)
    const id = req.params.id;
    let sql = `SELECT * FROM ongoing_registration WHERE gen_id = ?`;
    try{
        db.query(sql, id, (err, result)=>{
            if(err) throw err;
            // console.log(result)
            if(result.length === 1){
                const date = new Date()
                const data = [result[0].name, result[0].username, result[0].password, result[0].email, result[0].phone_number, result[0].referred, date];
                let sql = `INSERT INTO registered_users (name, username, password, email, phone_number, referred, timeout) values (?, ?, ?, ?, ?, ?, ?)`
                db.query(sql, data, (err, result) => {
                    if(err)throw err;
                    let sql = `DELETE FROM ongoing_registration WHERE gen_id = ?`;
                    db.query(sql, id, (err, result)=>{
                        if(err)throw err;
                        // console.log(result);
                        req.session.email = data[3];
                        // console.log(req.session.email, 'this is the email', data[3])
                        req.session.msg = 'Your account has been created successfully!!'
                        res.redirect('/bank');
                    });
                });
            }else if(result.length < 1){
                res.status(404).render('404')
            }
        })
    } catch(error){

    }
});
module.exports = auth;