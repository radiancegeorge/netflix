const express = require('express');
const invest = express.Router();
const db = require('../db');
const personalDb = require('../personalDb');
const uniqid = require('uniqid');


invest.post('/invest',(req, res)=>{
    const amount = req.body.amount;
    const user = req.app.locals.user;
    const investmentDetails = {};
    investmentDetails.username = user;
    investmentDetails.amount = amount;
    const sql = `insert into to_pay (id, username, amount) values (?,?,?)`;
    db.query(sql,[uniqid.time(), user, amount], (err, result)=>{
        if(err)throw err;
        const data = {};
        data.wait = true;
        const sql = `select * from awaiting_payment order by id asc`;
        db.query(sql, (err, result)=>{
            if(err)throw err;
            if(result.length < 1){
                // no one on payrow, can check admin or maybe not.. still thinking
                // data
                res.render('dashboard_home',{data})
            }else{
                //found persons, now check if amount is met
                const compatible = result.filter(eachTransaction =>{
                    if(eachTransaction.amount_recieved + amount <= amount_to_be_recieved){
                        //compatible so pair the both of them
                        return eachTransaction;
                    }
                });
                if(compatible.length < 1){
                    //no compartible person to pay to;
                    data.wait = true;
                    res.render('dashboard_home', {data})
                }else{
                    //found one or more compartible persons;
                    compatible = compatible[0];
                    //insert recievers name in to_pay table as reciever;
                    const sql = `update table to_pay set reciever = ? ,date = ? where username = ?`;
                    db.query(sql,[compatible.username, new Date(), user], (err, result)=>{
                        if(err)throw err;
                        data.wait = false;
                        res.render('dashboard_home', {data})
                    })
                }
            }
        })
    })
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