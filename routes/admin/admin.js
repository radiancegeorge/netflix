const express = require('express');
const admin = express.Router();
const db = require('../db');
const personalDb = require('../personalDb')
const awaiting  = require('../awaitingDb');

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
        console.log(result, 'result for admin search on registered users')
        if(result.length === 1){
            data.payee = result[0].username;
            data.payeeName = result[0].name;
            req.app.locals.userName = data.payee;
            const sql = 'select username from to_pay where username = ?';
            db.query(sql, data.payee, (err, result) => {
                if (err)throw err;
                console.log(result, 'found in to_pay')
                if(result.length < 1){
                    //user has no ongoing investment; find a way to get the message accross
                    console.log('no investment');
                    data.msg = 'user has no investment';
                    data.paid = true
                    res.render('admin')
                }else{
                    // const payersTransactionDetails = result[0];
                    //get a list of all the tables so we can start searching for one that contains the investor in the awaiting payment database;
                    awaiting.query('show tables', (err, result) => {
                        if (err) throw err;
                        if (result.length < 1) {
                            //no table in here;
                            // fresh database;

                        } else {
                            //not an empty database so continue with search for investors name;
                            const outcome = result;
                            let tablesContainingInvestor = outcome.map(table => {
                                //trying to return tables containing the investors username
                                const tableName = table.Tables_in_netftgvf_awaiting_payment;
                                const sql = `select * from ${tableName} where username = ?`;
                                awaiting.query(sql, data.payee, (err, result) => {
                                    if (err) throw err;
                                    //return table name and user if exist;
                                    if (result.length === 1) {
                                        return {
                                            tableName,
                                            result: result[0],
                                        }
                                    } else {
                                        //this table doesnt have investor on it
                                    }
                                })
                            });
                            tablesContainingInvestor = tablesContainingInvestor.filter(item => {
                                if (item != undefined) {
                                    return item
                                }
                            })
                            console.log(tablesContainingInvestor, 'this are tables containnng investors');
                            if(tablesContainingInvestor.length != 0){
                                data.transactions = tablesContainingInvestor
                                res.render('admin', { data });
                            }else{
                                // data.paid = true
                                res.render('admin', {data})
                            }
                        }
                    })
                }
            });
        }else{
            //user not active or does not exist;
            msg = 'user does not exist'
            res.render('admin', {data: msg})
        }
    })
});
admin.post('/validate_payment', (req, res)=>{
    data = {}
    const username = req.body.username;
    const reciever = req.body.reciever;
    const sql = `select amount from ${reciever} where username = ${username}`;
    awaiting.query(sql, (err, result)=>{
        if(err)throw err;
        //now add amount to transaction;
        if(result.length === 1){
            const amount = Number(result[0].amount);
            const sql = `select * from ${reciever}`;
            personalDb.query(sql, (err, result)=>{
                if(err)throw err;
                if(!result.length < 1 ){
                    //table has data;
                    const id = result[result.length - 1].transaction_id
                    const recieversBalance = Number(result[result.length - 1].amount_recieved);
                    const newAmount = recieversBalance + amount;
                    //updating balance for reciever;
                    const sql = `update ${reciever} set amount_recieved = ${newAmount} where transaction_id = ${id}`;
                    personalDb.query(sql, (err, result)=>{
                        if(err)throw err;
                        console.log(result, 'amount has been updated for the reciever');
                        //update status in awaiting payment database to true for this reciever;
                        const sql = `delete from ${reciever} where username = ${username}`;
                        awaiting.query(sql, (err, result)=>{
                            if(err)throw err;
                            console.log(result, 'deleted user from this reciever');
                            //extra, check if this user is found in other tables;

                            awaiting.query('show tables', (err, result) => {
                                if (err) throw err;
                                if (result.length < 1) {
                                    //no table in here;
                                    // fresh database
                                } else {
                                    //not an empty database so continue with search for investors name;
                                    const outcome = result;
                                    let tablesContainingInvestor = outcome.map(table => {
                                        //trying to return tables containing the investors username
                                        const tableName = table.Tables_in_netftgvf_awaiting_payment;
                                        const sql = `select * from ${tableName} where username = ${username}`;
                                        awaiting.query(sql, (err, result) => {
                                            if (err) throw err;
                                            //return table name and user if exist;
                                            if (result.length === 1) {
    
                                                return {
                                                    tableName,
                                                    result: result[0]
                                                }
                                            } else {
                                                //this table doesnt have investor on it
                                            }
                                        })
                                    });
                                    tablesContainingInvestor = tablesContainingInvestor.filter( item =>{
                                        if(item != undefined){
                                            return item
                                        }
                                    })
                                    console.log(tablesContainingInvestor, 'this are tables containnng investors');
                                    if (tablesContainingInvestor.length != 0) {
                                        data.transactions = tablesContainingInvestor
                                        res.render('admin', { data })
                                    } else {
                                        // empty, user is done investing;

                                        //check if personal table has morethan 2 transactions;

                                        //delete user from to_pay table

                                        const sql = `delete from to_pay where username = ${username}`;
                                        db.query(sql, (err, result)=>{
                                            if(err)throw err;
                                            //deleted from to pay and getting ready to be added to awaiting;
                                            const sql = `select * from ${username}`;
                                            personalDb.query(sql, (err, result) => {
                                                if (err) throw err;
                                                if (result.length >= 2) {
                                                    const amount = Number(result[result.length - 1].amount_paid)
                                                    const transactio_id = result[result.length - 1].transaction_id
                                                    const amount_recieved = result[result.length - 1].amount_recieved
                                                    //add to awaiting_payment and create a table in awaiting database;
                                                    const sql = `insert into awaiting_payment (transaction_id, username, amount_paid, amount_recieved, amount_to_be_recieved) values (?,?,?,?,?)`;
                                                    const toBeRecieved = Number(amount) + (amount * 50 / 100)

                                                    db.query(sql, [transactio_id,username, amount, amount_recieved, toBeRecieved], (err, result) => {
                                                        if (err) throw err;
                                                        //inserted into awaiting table, next create table for user in awaiting database;
                                                        const sql = `create table ${username} (id varchar(45) primary key, username varchar(45) unique, amount varchar(255), date varchar(255), status varchar(45))`;
                                                        awaiting.query(sql, (err, result) => {
                                                            if (err) throw err;
                                                            console.log('has been added to the awaitinng databas for recieving');
                                                            res.redirect('admin')
                                                        })
                                                    })

                                                }
                                            })
                                        })
                                        
                                    
                                        res.redirect('admin')
                                    }
                                }
                            })
                        })

                    })
                }
            })
        }else{
            //best guess an error
        }
    })

});


admin.get('/validate_payment', (req, res)=>{
    const user = req.app.locals.userName;
    const sql = `select * from to_pay where username = ?`;
    db.query(sql, user, (err, result)=>{
        if(err)throw err;
        const data =  result[0];
        const sql = `delete from to_pay where username = ?`;
        db.query(sql,user, (err, result) => {
            if (err) throw err;
            //deleted from to pay and getting ready to be added to awaiting;
            const sql = `select * from ${user}`;
            personalDb.query(sql, (err, result) => {
                if (err) throw err;
                if (result.length >= 2) {
                    const amount = Number(result[result.length - 1].amount_paid)
                    const transactio_id = result[result.length - 1].transaction_id
                    const amount_recieved = result[result.length - 1].amount_recieved
                    //add to awaiting_payment and create a table in awaiting database;
                    const sql = `insert into awaiting_payment (transaction_id, username, amount_paid, amount_recieved, amount_to_be_recieved) values (?,?,?,?,?)`;
                    const toBeRecieved = amount + (amount * 50 / 100)
                    db.query(sql, [transactio_id,user, amount, amount_recieved, toBeRecieved], (err, result) => {
                        if (err) throw err;
                        //inserted into awaiting table, next create table for user in awaiting database;
                        const sql = `create table ${user} (id varchar(45) primary key, username varchar(45) unique, amount varchar(255), date varchar(255), status varchar(45))`;
                        awaiting.query(sql, (err, result) => {
                            if (err) throw err;
                            console.log('has been added to the awaitinng databas for recieving');
                            res.redirect('/admin')
                        })
                    })

                }
            })
        })
    })
})
// console.log(5000+(5000 * 50/100))
module.exports = admin;

