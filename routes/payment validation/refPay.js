const express = require('express');
const refPay = express.Router();
const db = require('../db');
const awaiting = require('../awaitingDb');
const refdb = require('../referralsDb');
const personalDb = require('../personalDb');
const uniqid = require('uniqid')
const sessions = require('../sessions')
const uuid = require('uuid');


refPay.use(sessions({
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
}))



refPay.get('/refWithdraw', (req, res)=>{
    console.log(req.session)
    const user = req.session.username;
    const data = {}
    data.total = Number(req.session.total) ;
    if(data.total >= 5000){
        //can attempt to withdraw;
        //checking if he has any ongoing transaction;
        const sql = `select username from to_pay where username = ?`;
        db.query(sql, user, (err, result)=>{
        if(err)throw err;
        if(result.length != 0){
            req.session.msg = 'You have an ongoing transaction that needs to be completed';
            res.redirect('/user/refer');
        }else{
            //check for user in awaiting_payment;
            const sql = `select username from awaiting_payment where username = ?`;
            db.query(sql, user, (err, result)=>{
                if(err)throw err;
                if(result.length != 0){
                    //found, transaction cannot go on;
                    req.session.msg = 'You have an ongoing transaction that needs to be completed';
                    res.redirect('/user/refer');
                }else{
                    //found in none... transaction can go on;
                    const transaction_id = uniqid.time();
                    const amount_paid = 0;
                    const amount_recieved = 0;
                    const amount_to_be_recieved = data.total
                    const sql = `insert into ${user} (transaction_id, amount_paid, amount_recieved) values (?,?,?)`;
                    personalDb.query(sql, [transaction_id, amount_paid, amount_recieved], (err, result)=>{
                        if(err)throw err;
                        console.log(result, 'added to personal db');
                        //add to awaiting payment for system to do justice;
                        const sql = `insert into awaiting_payment (transaction_id, username, amount_paid, amount_recieved, amount_to_be_recieved) values (?,?,?,?,?)`;
                        db.query(sql, [transaction_id, user, amount_paid, amount_recieved, amount_to_be_recieved ], (err, result)=>{
                            if(err)throw err;
                            //successully added to awaiting;
                            //add to awaiting db
                            const sql = `create table ${user} (id varchar(45) primary key, username varchar(45) unique, amount varchar(255), date varchar(255), status varchar(45))`;
                            awaiting.query(sql, (err, result)=>{
                                if(err) throw err;
                                // created;
                                // reset  amount, 
                                const sql = ` update ${user} set amount = ? where amount is not null`;
                                refdb.query(sql, 0, (err, result) => {
                                    if (err) throw err;
                                    console.log(result, 'set all field not null to zero');
                                    req.session.msg = 'The system will merge you to be paid'
                                    res.redirect('/user/refer');
                                })
                            })
                            
                        })
                    })
                }
            })
        }
    })
    }else{
        req.session.msg = 'Your bonus needs to be up to N5000';
        res.redirect('/user/refer');
    }

})
// console.log(uniqid.time())

module.exports = refPay;