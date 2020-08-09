const express = require('express');
const db = require('../db');
const awaiting = require('../awaitingDb');
const personalDb = require('../personalDb');
const validate = express.Router();

validate.use(express.urlencoded({extended: false}))

validate.post('/validate_payment/', (req, res) => {
    data = {}
    const username = req.body.username ;
    const reciever = req.body.reciever || req.app.locals.user;
    const file = {};
    if(req.body.reciever === undefined){
        file.data = '/user/home'
    }else{
        file.data = '/admin'
    }
    const sql = `select amount from ${reciever} where username = ?`;
    awaiting.query(sql, username, (err, result) => {
        if (err) throw err;
        //now add amount to transaction;
        if (result.length === 1) {
            const amount = Number(result[0].amount);
            const sql = `select * from ${reciever}`;
            personalDb.query(sql, (err, result) => {
                if (err) throw err;
                if (!result.length < 1) {
                    //table has data;
                    const id = result[result.length - 1].transaction_id
                    const recieversBalance = Number(result[result.length - 1].amount_recieved);
                    const newAmount = recieversBalance + amount;
                    //updating balance for reciever;
                    const sql = `update ${reciever} set amount_recieved = ${newAmount} where transaction_id = '${id}'`;
                    personalDb.query(sql, (err, result) => {
                        if (err) throw err;

                        console.log(result, 'amount has been updated for the reciever');
                        //update status in awaiting payment database to true for this reciever;

                        
                        const sql = `delete from ${reciever} where username = ?`;
                        awaiting.query(sql, username, (err, result) => {
                            if (err) throw err;
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
                                    const promise = new Promise((resolve, reject) => {
                                        const searchData = []
                                        outcome.forEach(table => {
                                            //trying to return tables containing the investors username
                                            const tableName = table.Tables_in_netftgvf_awaiting_payment;
                                            const sql = `select * from ${tableName} where username = ?`;
                                            awaiting.query(sql, username, (err, result) => {
                                                if (err) throw err;
                                                //return table name and user if exist;
                                                if (result.length === 1) {

                                                    searchData.push({
                                                        reciever: tableName,
                                                        investor: result[0]
                                                    })
                                                } else {
                                                    //this table doesnt have investor on it
                                                }
                                            })
                                        });
                                        setTimeout(() => {
                                            resolve(searchData)
                                        }, 3000);
                                    })
                                    promise.then(result => {
                                        if (result.length != 0) {
                                            data.transactions = result;
                                            console.log(result, 'wheather he still has unsettled')
                                            res.redirect(file.data)
                                        } else {
                                            // empty, user is done investing;
                                            // if(file.data === '/user/home'){
                                            //     res.redirect(file.data);
                                            // }
                                            //check if personal table has morethan 2 transactions;
                                            //first check if amount in to_pay is = 0;
                                            const sql = `select amount from to_pay where username = ?`;
                                            db.query(sql, username, (err, result)=>{
                                                if(err)throw err;
                                                if(result.length === 1){
                                                    const remainingAmount = Number(result[0].amount);
                                                    if(remainingAmount === 0){
                                                        //delete user from to_pay table
                                                        const sql = `delete from to_pay where username = ?`;
                                                        db.query(sql, username, (err, result) => {
                                                            if (err) throw err;
                                                            console.log('finished transaction for investor, now deleting from to_pay')
                                                            //######
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

                                                                    db.query(sql, [transactio_id, username, amount, amount_recieved, toBeRecieved], (err, result) => {
                                                                        if (err) throw err;
                                                                        //inserted into awaiting table, next create table for user in awaiting database;
                                                                        const sql = `create table ${username} (id varchar(45) primary key, username varchar(45) unique, amount varchar(255), date varchar(255), status varchar(45))`;
                                                                        awaiting.query(sql, (err, result) => {
                                                                            if (err) throw err;
                                                                            console.log('has been added to the awaitinng databas for recieving');
                                                                            res.redirect(file.data)
                                                                        })
                                                                    })

                                                                }
                                                            })
                                                        })
                                                    }else{
                                                        res.redirect(file.data)
                                                    }

                                                }
                                            })
                                            


                                            // res.redirect('admin')
                                        }
                                    })

                                }
                            })
                        })

                    })
                }
            })
        } else {
            //best guess an error
        }
    })

});

module.exports = validate