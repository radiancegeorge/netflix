const express = require('express');
const invest = express.Router();
const db = require('../db');
const personalDb = require('../personalDb');
const uniqid = require('uniqid');


invest.post('/invest',(req, res)=>{
    const amount = req.body.amount;
    if(amount >= 2000 && amount <= 200000){
        const user = req.app.locals.user;
//firstly lets find out the users previous pay in to continue transaction;
        //if empty table or amount not less than previous paid, carry on with the transaction
        const sql = `select * from ${user}`;
        personalDb.query(sql, (err, result)=>{
            if(err)throw err;
            const lastData = result[result.length - 1];
            if(result.length < 1 || amount >= lastData.amount_paid){
                //transaction can go on
                const investmentDetails = {};
                investmentDetails.username = user;
                investmentDetails.amount = amount;
                const sql = `insert into to_pay (id, username, amount) values (?,?,?)`;
                db.query(sql, [uniqid.time(), user, amount], (err, result) => {
                    if (err) throw err;
                    const data = {};
                    data.wait = true;
                    const sql = `select * from awaiting_payment order by id asc`;
                    db.query(sql, (err, result) => {
                        if (err) throw err;
                        if (result.length < 1) {
                            // no one on payrow, can check admin or maybe not.. still thinking
                            // data
                            res.redirect('/user/home')
                        } else {
                            //found persons, now check if amount is met
                            let compatible = result.filter(eachTransaction => {
                                if (eachTransaction.amount_recieved + amount <= eachTransaction.amount_to_be_recieved) {
                                    //compatible so pair the both of them
                                    return eachTransaction;
                                }
                            });
                            if (compatible.length < 1) {
                                //no compartible person to pay to;
                                data.wait = true;
                                res.redirect('/user/home')
                            } else {
                                //found one or more compartible persons;
                                compatible = compatible[0];
                                //insert recievers name in to_pay table as reciever;
                                const sql = `update to_pay set reciever = ? ,date = ? where username = ?`;
                                db.query(sql, [compatible.username, new Date(), user], (err, result) => {
                                    if (err) throw err;
                                    data.wait = false;
                                    res.redirect('/user/home')
                                });
                            }
                        }
                    })
                })
            }else{
                //transaction cannot go on
            }
        })

        
    }else{
        //amount is not within what is accepted by the system
    }
    
})
// console.log(uniqid.time())


// const numbers = [1];

// const even = numbers.filter(num =>{
//     if(num % 2 === 0){
//         return num
//     }
// });
// console.log(even)












module.exports = invest;