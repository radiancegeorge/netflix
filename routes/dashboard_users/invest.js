const express = require('express');
const invest = express.Router();
const db = require('../db');
const personalDb = require('../personalDb');
const uniqid = require('uniqid');
const awaiting = require('../awaitingDb')


invest.post('/invest',(req, res)=>{
    const amount = req.body.amount;
    if(amount >= 2000 && amount <= 200000){
        console.log('within range')
        const user = req.app.locals.user;
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

                        //searching awaiting payment for possible transactions
                        const sql = `select * from awaiting_payment order by id asc`;
                        db.query(sql, (err, result) => {
                            if (err) throw err;
                            if (result.length < 1) {
                                // no one on payrow, can check admin or maybe not.. still thinking
                                // data
                                res.redirect('/user/home')
                            } else {
                                //found persons, now check if amount is met
                                const everyone = result;

                                // now checking for each user that can be satisfied
                                everyone.forEach(person => {
                                    const sql = `select * from to_pay where username = ?`
                                    db.query(sql,user, (err, result) => {
                                        if (err) throw err;
                                        const id = result[0].id
                                        const amount = Number(result[0].amount);
                                        const amountRecieved = Number(person.amount_recieved)
                                        const amountToBeRecieved = Number(person.amount_to_be_recieved)
                                        if (amount + amountRecieved > amountToBeRecieved && amount != 0) {
                                            //get what is remaining to complete this users transaction from the investor;
                                            const remaining = amountToBeRecieved - amountRecieved;
                                            //what will be left of the investors money
                                            const investorsRemaining = amount - remaining;
                                            const newRecieved = remaining + amountRecieved;
                                            //add to the recievers recieved amount;
                                            const sql = `update awaiting_payment set amount_recieved = ? where username = '${person.username}' `;
                                            db.query(sql, newRecieved, (err, result) => {
                                                if (err) throw err;
                                                console.log(result, 'updated amount in awaiting_table');
                                                //send investors data to recievers awaiting table;
                                                const sql = `insert into ${person.username} (id, username, amount, date, status) values (?,?,?,?,?)`;
                                                awaiting.query(sql, [id, user, remaining, new Date(), 'not paid'], (err, result) => {
                                                    if (err) throw err;
                                                    console.log('inserted into recievers personal table');
                                                    //update investors amount
                                                    const sql = `update to_pay set amount = ${investorsRemaining} where username = ?`;
                                                    db.query(sql,user, (err, result) => {
                                                        if (err) throw err;
                                                        // current balance updated
                                                        if (everyone.indexOf(person) === everyone.length - 1) {
                                                            res.redirect('/user/home');
                                                        }
                                                    })
                                                })
                                            });


                                        } else if (amount + amountRecieved <= amountToBeRecieved && amount != 0) {
                                            //push everything to reciever
                                            const sql = `insert into ${person.username} (id, username, amount, date, status) values (?,?,?,?,?)`;
                                            awaiting.query(sql, [id, user, amount, new Date(), 'not paid'], (err, result) => {
                                                if (err) throw err;
                                                console.log('inserted into recievers personal table');
                                                //update investors amount;
                                                const amountRecievedUpdate = amount + amountRecieved;

                                                const sql = `update awaiting_payment set amount_recieved = ?  where username = ?`;
                                                db.query(sql, [amountRecievedUpdate, person.username], (err, result)=>{
                                                    if(err)throw err;
                                                    console.log(result, 'reciever amount updated')
                                                    const sql = `update to_pay set amount = ${0} where username = ?`;
                                                    db.query(sql, user, (err, result) => {
                                                        if (err) throw err;
                                                        // current balance updated
                                                        if (everyone.indexOf(person) === everyone.length - 1) {
                                                            res.redirect('/user/home');
                                                        }
                                                    })
                                                } )
                                                
                                            })
                                        } else {
                                            //no match at all, so leave for system to figure out later, just go home if its the last in the loop6
                                            if (everyone.indexOf(person) === everyone.length - 1) {
                                                res.redirect('/user/home');
                                            }
                                        }
                                    })
                                });

 
                                // let compatible = result.filter(eachTransaction => {
                                //     if (eachTransaction.amount_recieved + amount <= eachTransaction.amount_to_be_recieved) {
                                //         //compatible so pair the both of them
                                //         return eachTransaction;
                                //     }
                                // });
                                // if (compatible.length < 1) {
                                //     //no compartible person to pay to;
                                //     data.wait = true;
                                //     res.redirect('/user/home')
                                // } else {
                                //     //found one or more compartible persons;
                                //     compatible = compatible[0];
                                //     //insert recievers name in to_pay table as reciever;
                                //     const sql = `update to_pay set reciever = ? ,date = ? where username = ?`;
                                //     db.query(sql, [compatible.username, new Date(), user], (err, result) => {
                                //         if (err) throw err;
                                //         data.wait = false;
                                //         res.redirect('/user/home')
                                //     });
                                // }
                            }
                        })
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
// console.log(uniqid.time())


// const numbers = [1];

// const even = numbers.filter(num =>{
//     if(num % 2 === 0){
//         return num
//     }
// });
// console.log(even)






// console.log(Number(0.9))





module.exports = invest;