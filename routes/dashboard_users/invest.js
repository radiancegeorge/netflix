const express = require('express');
const invest = express.Router();
const db = require('../db');
const personalDb = require('../personalDb');
const uniqid = require('uniqid');
const awaiting = require('../awaitingDb');
const customMail = require('../customMail')


invest.post('/invest',(req, res)=>{
    const amount = req.body.amount;
    if(amount >= 2000 && amount <= 200000){
        console.log('within range');
        // console.log(req.session.username, 'still checking something')
        const user = req.session.username;
//firstly lets find out the users previous pay in to continue transaction;
        //if empty table or amount not less than previous paid, carry on with the transaction
        const sql = `select * from ${user}`;
        personalDb.query(sql, (err, result)=>{
            if(err)throw err;
            const lastData = result[result.length - 1];
            // console.log(typeof lastData.amount_paid)
            if(result.length < 1 || amount >= Number(lastData.amount_paid)){
                //transaction can go 
                console.log('transaction can go on, not lower than previous')
                const investmentDetails = {};
                investmentDetails.username = user;
                investmentDetails.amount = amount;
                const sql = `insert into to_pay (id, username, amount) values (?,?,?)`;
                const transactionId = uniqid.time();
                db.query(sql, [transactionId, user, amount], (err, result) => {
                    if (err) throw err;
                    const data = {};
                    data.wait = true;
                    //insert data into personal db too for reference later;
                    const sql = `insert into ${user} (transaction_id, amount_paid, amount_recieved) values (?,?, ?)`;
                    personalDb.query(sql, [transactionId, amount, 0], (err, result)=>{
                        if(err)throw err;
                        console.log('has been added to personal database');
                        res.redirect('/user/home');
                    })
                    
                })
            }else{
                //transaction cannot go on
                console.log('lower than previous amount')
            }
        })

        
    }else{
        //amount is not within what is accepted by the system
    }
    
})
invest.post('/paid', (req, res)=>{
    // console.log(req.app.locals.everyDetail, 'this are users details');
    const data = req.session.everyDetail
    const text = `
    The user with the following details wishes to let you know that he/she has paid to be activated
    name: ${data.name}
    phone number: ${data.phone_number}
    user name: ${data.username}
    email: ${data.email}
    
    `;
    const adminMail = 'radiancegeorge@gmail.com';
    req.session.msg = 'The admin has been notified of Your claims, You will get a Response shortly'
    customMail(adminMail, text);
    setTimeout(() => {
        res.redirect('/login')
    }, 3000);
})





module.exports = invest;