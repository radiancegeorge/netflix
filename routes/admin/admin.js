const express = require('express');
const admin = express.Router();
const db = require('../db');
const personalDb = require('../personalDb')
// const { resume } = require('../db');

admin.use(express.urlencoded({extended: false}))

admin.get('/', (req, res)=>{
    res.render('admin', {data: 'welcome'})
});

admin.post('/find_user', (req, res)=>{
   if(req.body.search != ''){
       const search = req.body.search;
       console.log(search);
       const sql = `select * from registered_users where username = ?`;
       db.query(sql, search, (err, result) => {
           if (err) throw err;
           if(result.length === 1){
               const data = {
                    user: result[0].name
                };
                req.app.locals.wholeData = result[0];
                //found user then another search to know if user is activated
                const sql = `select username from activated_users where username = ?`;
                db.query(sql, search, (err, result) => {
                    if (err) throw err;
                    result.length < 1 ? data.activated = false : data.activated = true;
                    console.log(data.activated)
                    req.app.locals.user = search;
                    res.render('admin', { data });
                 })
           }else{
               res.render('admin', {data: 'no search result'})// search failed
           }
           
       });
   }else{
       res.render('admin', {data: 'empty input'});
   }
});
admin.post('/status', (req, res)=>{
    data = req.body;
    data.user = req.app.locals.user;
    data.wholeData = req.app.locals.wholeData;
    // console.log(data.wholeData.id)
    const sql = `select * from activated_users where username = ?`;
    db.query(sql, data.user, (err, result)=>{
        if(err)throw err;
        if(result.length === 1){
            const sql = 'delete from activated_users where username = ?';
            db.query(sql, data.user, (err, result)=>{
                if(err)throw err;
                console.log(result);
                res.render('admin', {data: 'changes have been made successfully'})
            })
        }else if(result.length < 1){
            const sql = 'insert into activated_users (id, username,email) value (?, ?, ?)';
            db.query(sql, [data.wholeData.id, data.wholeData.username, data.wholeData.email], (err, result)=>{
                if(err)throw err;
                console.log(result);
                
                res.render('admin', {data: 'changes has been made successfully'})
            })
        }
    })
})
admin.post('/transactions', (req, res)=>{
    data = {}
    const search = req.body.search;
    const sql = `select username, name from registered_users where username = ?`;
    db.query(sql, search, (err, result)=>{
        if(err) throw err;
        if(result.length === 1){
            data.payee = result[0].username;
            data.payeeName = result[0].name
            const sql = 'select username from to_pay where username = ?';
            db.query(sql, data.payee, (err, result)=>{
                if(err)throw err;
                if(result.length === 1){
                    data.paid = false;
                    req.app.locals.payee = data.payee
                    res.render('admin', {data})

                }else{
                //user paid so therefore nothing found..... do something with it;
                    data.paid = true;
                    res.render('admin', {data})
                }
            })
        }else{
            //user not active or does not exist;
            msg = 'user does not exist'
            res.render('admin', {data: msg})
        }
       
    })
});
admin.get('/validate_payment', (req, res)=>{
    //verify user payment through the admin
    if(req.app.locals.payee){
        const user = req.app.locals.payee;
        const sql = `select * from to_pay where username = ?`;
        db.query(sql, user, (err, result)=>{
            if(err)throw err;
            const payersTransactionDetails = result[0];
            if(payersTransactionDetails.reciever != null){
                const sql = `select amount_recieved from awaiting_payment where username = ?`;
                db.query(sql, payersTransactionDetails.reciever, (err, result)=>{
                    if(err)throw err;
                    const amount_recieved = result[0].amount_recieved
                    const sql = `update awaiting_payment set amount_recieved = ? where username = ?`;
                    db.query(sql, [Number(payersTransactionDetails.amount) + Number(amount_recieved), payersTransactionDetails.reciever], (err, result)=>{
                        if(err)throw err;
                        console.log(result, 'amount recieved has been updated');
                        //after amount recieved update, now write data to personal data;
                        const sql = `insert into ${user} (transaction_id, amount_paid, amount_recieved) values (?,?,?)`;
                        personalDb.query(sql, [ payersTransactionDetails.id, payersTransactionDetails.amount, 0], (err, result)=>{
                            if(err)throw err;
                            //now inserted personal info, next is to check if length of row is greater or equal to 2;
                            const sql = `select * from ${user}`;
                            personalDb.query(sql, (err, result)=>{
                                if(err)throw err;
                                if(result.length >= 2){
                                    //add to awaiting payment
                                    const sql = `insert into awaiting_payment (transaction_id,username, amount_paid, amount_to_be_recieved, amount_recieved) values (?,?,?,?,?)`;
                                    // const added = Number(payersTransactionDetails.amount) + Number(payersTransactionDetails.amount * 50 / 100);
                                    // console.log(added)
                                    db.query(sql, [payersTransactionDetails.id, user,payersTransactionDetails.amount, Number(payersTransactionDetails.amount) + Number(payersTransactionDetails.amount * 50/100), 0], (err, result)=>{
                                        if(err)throw err;
                                        //inserted successully, now delete record from to_pay;
                                        const sql = `delete from to_pay where username = ?`;
                                        db.query(sql, user, (err, result)=>{
                                            if(err)throw err;
                                            console.log(result,' deleted from to_pay')
                                            //record deleted
                                        })
                                    })
                                }else{
                                    //not greater than 2, just delete from to_pay;
                                    const sql = `delete from to_pay where username = ?`;
                                    db.query(sql, user, (err, result) => {
                                        if (err) throw err;
                                        console.log(result, ' deleted from to_pay but not added to awaiting list')
                                        //record deleted
                                    });
                                };
                            });
                        });
                    });
                })
               
            }else{
                //no reciever so just proceed.... the project should be this way in the beginning
                const sql = `insert into ${user} (transaction_id, amount_paid, amount_recieved) values (?,?,?)`;
                personalDb.query(sql, [ payersTransactionDetails.id, payersTransactionDetails.amount, 0], (err, result) => {
                    if (err) throw err;
                    //now inserted personal info, next is to check if length of row is greater or equal to 2;
                    const sql = `select * from ${user}`;
                    personalDb.query(sql, (err, result) => {
                        if (err) throw err;
                        if (result.length >= 2) {
                            //add to awaiting payment
                            const sql = `insert into awaiting_payment (transaction_id,username, amount_paid, amount_to_be_recieved, amount_recieved) values (?,?,?,?,?)`;
                            db.query(sql, [payersTransactionDetails.id, user, payersTransactionDetails.amount, Number(payersTransactionDetails.amount) + Number(payersTransactionDetails.amount * 50 / 100), 0], (err, result) => {
                                if (err) throw err;
                                //inserted successully, now delete record from to_pay;
                                const sql = `delete from to_pay where username = ?`;
                                db.query(sql, user, (err, result) => {
                                    if (err) throw err;
                                    console.log(result, ' deleted from to_pay')
                                    //record deleted
                                    res.redirect('/admin')
                                })
                            })
                        } else {
                            //not greater than 2, just delete from to_pay;
                            const sql = `delete from to_pay where username = ?`;
                            db.query(sql, user, (err, result) => {
                                if (err) throw err;
                                console.log(result, ' deleted from to_pay but not added to awaiting list')
                                //record deleted
                                res.redirect('/admin')
                            });
                        };
                    });
                });
            };
        });
    }else{
        //a huge error..... do something
    }
    
})
// console.log(5000+(5000 * 50/100))
module.exports = admin;