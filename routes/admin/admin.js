const express = require('express');
const admin = express.Router();
const db = require('../db');
const personalDb = require('../personalDb')
const awaiting  = require('../awaitingDb');
const bcryt = require('bcrypt');

admin.use(express.urlencoded({extended: false}));
const username = 'netflix@admin.com'
const password = '$2b$10$3U7Hhffvay2rrUyGZZAM1Ohzb2aMuSu5Bdotaevv8WaSLmqTb1wbK'

admin.get('/', (req, res)=>{
    if(req.app.locals.user === username){
        res.render('admin', {data: 'welcome'})
    }else{
        res.send(`
     <form action="/admin" method = "Post" enctype="application/x-www-form-urlencoded">
                <h2 class="signinbig">
                    SIGN IN TO <span>Admin</span> 
                </h2>
                <label class="" for="">
                    Username
                    <input type="text" placeholder="Enter Your Username" required name = "username">
                </label>
                <label class="" for="">
                    Password
                    <input type="password" placeholder="Enter Your password" required name = "password">
                </label>
                <button class="submitbtn">
                    Sign In
                </button>
                <a href="">
                    <p>
                        Forgot password?
                    </p>
                </a>
                <a href="">
                    <p>
                    I don't have an account
                    </p>
                </a>
                
            </form>
    `)
    }
});
admin.post('/', (req, res)=>{
    data = req.body;
    if(data.username === username){
        bcryt.compare(data.password, password).then(result =>{
            if(result){
                req.app.locals.user = data.username
                res.render('admin', {data: 'welcome'})
            }else{
                req.app.locals.wrong = 'wrong password';
                res.redirect('/admin')
            }
        })

    }else{
        req.app.locals.wrong = 'wrong username';
        res.redirect('/admin')
    }
})
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
                if(result.length < 1){
                    //user has no ongoing investment; find a way to get the message accross
                    console.log('no investment');
                    data.msg = 'user has no investment';
                    data.paid = true
                    res.render('admin', {data})
                }else{
                    console.log(result, 'found in to_pay')

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

                            const promise = new Promise((resolve, reject)=>{
                                const searchData = []
                                    outcome.map(table => {
                                        //trying to return tables containing the investors username
                                        const tableName = table.Tables_in_netftgvf_awaiting_payment;
                                        
                                        const sql = `select * from ${tableName} where username = ?`;
                                        awaiting.query(sql, data.payee, (err, result) => {
                                            if (err) throw err;
                                            //return table name and user if exist;
                                            if (result.length === 1) {
                                                const item = {
                                                    reciever: tableName,
                                                    investor: result[0]
                                                }
                                                searchData.push(item)
                                            } else {
                                                //this table doesnt have investor on it
                                            }
                                        })
                                    });
                                setTimeout(() => {
                                    resolve(searchData);
                                }, 3000);
                            })
                            promise.then(result=>{
                                console.log(result, 'resolved promise');                                  
                                if (result.length != 0) {
                                    data.transactions = result
                                    res.render('admin', { data });
                                } else {
                                    // data.paid = true
                                    res.render('admin', { data })
                                }
                            })
                            // setTimeout(() => {
                            //     console.log(tablesContainingInvestor, 'this are tables containnng investors');

                            // }, 10000);
                            // 
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

