const express =  require('express');
const dashboard = express.Router();
const db = require('../db');
const invest = require('./invest');
const awaiting = require('../awaitingDb')

dashboard.get('/dashboard', (req, res)=>{
    console.log(req.session.username)
    if(req.session.username || req.app.locals.regEmail){
        const data = req.app.locals.regEmail || req.session.username;
        req.session.username = data;
        const sql = `select * from activated_users where username = ? or email = ?`;
        db.query(sql, [data ,data], (err, result)=>{
            if(err)throw err;
            // console.log(result, 'this is the result')
            const status = {}
            result.length < 1 ? status.activated = false : status.activated = true;
            res.render('user_dashboard', { status });
        })
    }else{
        res.redirect('/login')
    }
    // res.render('user_dashboard');
});

dashboard.get('/profile', (req, res)=>{
    const sql = `select * from registered_users where email = ? or username = ?`;
    const email = req.session.username
    db.query(sql, [email, email], (err, resut)=>{
        if(err)throw err;
        const data = resut[0]
    res.render('profile.ejs', {data});

    })
});
dashboard.get('/home', (req, res)=>{
    const data = {}
    req.app.locals.user = req.session.username;
    const user = req.app.locals.user
    const sql = 'select * from to_pay where username = ?';
    db.query(sql, user, (err, result)=>{
        if(err)throw err;
        if(result.length < 1){
            //not found so check in awaiting table to know if he is supposed to be paid;
            const sql = 'select * from awaiting_payment where username = ?';
            db.query(sql, user, (err, result)=>{
                if(err)throw err;
                if(result.length < 1){
                    //found nothing in awaiting payment also; so render home with ability to commence transaction;
                    data.initialization = true;
                    res.render('dashboard_home', {data})
                }else if(result.length === 1){
                    data.initialization = false;
                    //found in awaiting so, check his table to see if any user has been placed under him;
                    const sql = `select * from ${user}`
                    awaiting.query(sql, (err, result)=>{
                        if(err)throw err;
                        if(result.length < 1){
                            // no investor merged yet;
                            data.waitingForPayment = true;
                            res.render('dashboard_home',{data})
                        }else{
                            //found investors merged
                           data.payers = result;
                            data.waitingForPayment = false;
                            res.render('dashboard_home', {data});
                        }
                    })                
                };
            });
        }else if(result.length === 1){

            //found in to pay table ... sweep through awaiting database for user in any of the colu
            console.log(result, 'found in to_pay table');

            awaiting.query('show tables', (err, result) => {
                if (err) throw err;
                if (result.length < 1) {
                    //no table in here;
                    // fresh database;
                    data.wait = true;
                    data.initialization = false
                    res.render('dashboard_home',{data})
                } else {
                    //not an empty database so continue with search for investors name;
                    const outcome = result;
                    const promise = new Promise((resolve, reject)=>{
                        const searchData = []

                        outcome.forEach(table => {
                            //trying to return tables containing the investors username
                            const tableName = table.Tables_in_netftgvf_awaiting_payment;
                            const sql = `select * from ${tableName} where username = ?`;
                            awaiting.query(sql, user, (err, result) => {
                                if (err) throw err;
                                //return table name and user if exist;
                                if (result.length === 1) {
                                    const content = result[0]
                                    const sql = `select bank_name, account_name, username, account_number, phone_number from registered_users where username = ?`;
                                    db.query(sql, tableName, (err, result)=>{
                                        if(err)throw err;
                                        searchData.push({
                                            reciever: result[0],
                                            amount: content.amount
                                        })
                                        console.log(result, 'details of whom to pay')
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
                    promise.then(result=>{
                        if (result.length != 0) {
                            data.initialization = false
                            data.transactions = result;
                            console.log(data.transactions)
                            


                            res.render('dashboard_home', { data })
                        } else {
                            data.wait = true;
                            res.render('dashboard_home', { data })
                        }
                    })
                    
                    
                    //  else {
                    //     // empty, user is done investing;

                    //     //check if personal table has morethan 2 transactions;

                    //     //delete user from to_pay table

                    //     const sql = `delete from to_pay where username = ${username}`;
                    //     db.query(sql, (err, result) => {
                    //         if (err) throw err;
                    //         //deleted from to pay and getting ready to be added to awaiting;
                    //         const sql = `select * from ${username}`;
                    //         personalDb.query(sql, (err, result) => {
                    //             if (err) throw err;
                    //             if (result.length >= 2) {
                    //                 const amount = result[result.length - 1].amount_paid
                    //                 const transactio_id = result[result.length - 1].transaction_id
                    //                 const amount_recieved = result[result.length - 1].amount_recieved
                    //                 //add to awaiting_payment and create a table in awaiting database;
                    //                 const sql = `insert into awaiting_payment (transaction_id, username, amount_paid, amount_recieved, amount_to_be_recieved) values (?,?,?,?,?)`;
                    //                 db.query(sql, [transactio_id, amount, amount_recieved], (err, result) => {
                    //                     if (err) throw err;
                    //                     //inserted into awaiting table, next create table for user in awaiting database;
                    //                     const sql = `create table ${username} (id varchar(45) primary key, username varchar(45) unique, amount varchar(255), date varchar(255), status varvhar(45))`;
                    //                     awaiting.query(sql, (err, result) => {
                    //                         if (err) throw err;
                    //                         console.log('has been added to the awaitinng databas for recieving');
                    //                         res.redirect('admin')
                    //                     })
                    //                 })

                    //             }
                    //         })
                    //     })


                    //     res.redirect('admin')
                    // }
                }
            })





            // //found him in pay_to table, now render who he is to pay to**** details

            // result = result[0];
            // console.log(result.reciever);
            // if(result.reciever != null){
            //     const reciever = result.reciever;
            //     const sql = `select username,phone_number, account_name, account_number, bank_name from registered_users where username = ?`;
            //     db.query(sql, reciever, (err, result)=>{
            //         if(err)throw err;
            //         data.reciever = result[0];
            //         res.render('dashboard_home',{data})
            //     })
            // }else{
            //     //no reciever to display cos no merge has occured;
            //     data.wait = true;
            //     res.render('dashboard_home', {data})
            // }
            
        }else{
            //an unknown problem occured
        }
    })

    // res.render('dashboard_home')
});

dashboard.get('/timer', (req, res)=>{
    // console.log(req.baseUrl)
    data = req.session.username;
    const sql = `select timeout from registered_users where username = ? or email = ?`;
    db.query(sql, [data, data], (err, result)=>{
        if(err)throw err;
        if(result.length === 1){
            console.log(result[0].timeout)
            res.send(result[0])
        }else{
            res.status(404).send('something went wrong')
        }
    })
})
dashboard.post('/dashboard/update_number', (req, res)=>{
    const data = req.body;
    const sql = `update registered_users set phone_number = ? where email = ?`
    db.query(sql, [data.phone_number, data.email], (err, result)=>{
        if(err)throw err;
        const data = result[0]
        res.redirect('/user/profile')
    })
});
dashboard.use(invest)
module.exports = dashboard;

