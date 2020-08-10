const express =  require('express');
const dashboard = express.Router();
const db = require('../db');
const invest = require('./invest');
const awaiting = require('../awaitingDb');
const refdb = require('../referralsDb');
const fileUpload = require('./fileUpload');
const notifDb = require('../notifDb');
const bcrypt = require('bcrypt');
const customMail = require('../customMail');
const uniqid = require('uniqid');
const domain = 'http://localhost:3000';
const personalDb = require('../personalDb')

const store = {
    user: ''
}

dashboard.use((req, res, next) => {
    res.locals.person = store.user;
    next()
});





dashboard.get('/dashboard', (req, res)=>{
    console.log(req.session.username);
    console.log()


    if(req.session.username || req.session.regEmail){
        const data = req.session.regEmail || req.session.username;
        req.session.username = data;
        store.user = data;
       
        
        const sql = `select * from activated_users where username = ? or email = ?`;
        db.query(sql, [data ,data], (err, result)=>{
            if(err)throw err;
            // console.log(result, 'this is the result')
            const status = {}
            result.length < 1 ? status.activated = false : status.activated = true;
            status.msg = req.session.msg;
            setTimeout(() => {
                req.session.msg = ''
            }, 3000);
            res.render('user_dashboard', { status });
            
        })
    }else{
        res.redirect('/login')
    }
    // res.render('user_dashboard');
});

dashboard.get('/profile', (req, res)=>{
    const data = {}
    data.msg = req.session.msg;
    setTimeout(() => {
        req.session.msg = ''
    }, 3000);
    const sql = `select * from registered_users where email = ? or username = ?`;
    const email = req.session.username
    db.query(sql, [email, email], (err, resut)=>{
        if(err)throw err;
        const data = resut[0]
    res.render('profile.ejs', {data});

    })
});
dashboard.get('/home', (req, res)=>{
    const data = {};
    data.message = req.session.msg;

    setTimeout(() => {
                req.session.msg = '';
            }, 3000);
    req.session.user = req.session.username;
    const user = req.session.username;
    const sqlt = `select * from ${user} order by transaction_id desc`;
    personalDb.query(sqlt, (err, result) => {
        if (err) throw err;
        if (result.length != 0) {
            data.transaction = result;
        }
    })
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
                    //check if user is to re commit this time
                    const sql = `select * from ${user}`;
                    personalDb.query(sql, (err, result)=>{
                        if(err)throw err;
                        result.length === 1 ? data.recommit = true : data.recommit = false;
                        res.render('dashboard_home', { data });

                    })

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
                }
            })
            
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
dashboard.get('/refer', (req, res)=>{
    const user = req.session.username;
    const promise = new Promise((resolve, reject)=>{
        const data = {};
        data.total = 0;
        const sql = `select amount from ${user} where amount is not null`;
        refdb.query(sql, (err, result)=>{
            if(err)throw err;
            if(result.length != 0){
                result.forEach(money =>{
                    const amount = Number(money.amount);
                    data.total += amount;
                })
            }else{
                data.noRef = true;
            }
            result.length >= 15 ? data.guide = true : data.guide = false;
        });
        setTimeout(() => {
            resolve(data)
        }, 2000);
    });
    promise.then(result=>{
        const data = result;
        data.msg = req.session.msg;
        setTimeout(() => {
            req.session.msg = ''
        }, 3000);
        data.ref = `www.netflixnetworking.com/register?ref=${user}`;
        req.session.username = user
        if(!data.noRef){
            req.session.total = data.total;
        };
        res.render('dashboard_ref', { data });

    })
});
dashboard.get('/notification', (req, res)=>{
    const data = {}
    console.log(req.session.username);
    const user = req.session.username;
    const sql = `select * from ${user} order by id desc limit 10 `;
    notifDb.query(sql, (err, result)=>{
        if(err)throw err;
        const notifications = result;
        if(notifications.length != 0){
            data.notification = notifications
            res.render('notification', {data});

        }else{

            data.notification = false
            res.render('notification', {data})
        }
    })
});
dashboard.get('/notification/view', (req, res)=>{
    if(req.query){
        const data = {}
        const user = req.session.username;
        const id = req.query.id;
        const sql = `select * from ${user} where id = ?`;
        notifDb.query(sql, id, (err, result)=>{
            if(err)throw err;
            if(result.length != 0){
                data.username = result[0].username;
                data.fileName = result[0].file_name;
                const sql = `select name, username, phone_number from registered_users where username = ?`
                db.query(sql, data.username, (err, result)=>{
                    if(err)throw err;
                    data.details = result[0];
                    res.render('display', {data})
                })
            }
        })
    }
    // res.render('display');
});

dashboard.get('/change_password', (req, res)=>{
    const data = {};
    data.msg = req.session.msg;
    setTimeout(() => {
        req.session.msg = ''
    }, 3000);
    res.render('changepassword', {data})
});

dashboard.post('/change_password', (req, res)=>{
    const data = req.body;
    if(data.old){
        const user = req.session.username;
        const sql = `select password from registered_users where username = ?`;
        db.query(sql, user, (err, result)=>{
            if(err)throw err;
            const password = result[0].password;
            bcrypt.compare(data.old, password)
            .then(result=>{
                if(result){
                    if(data.password === data.rePassword){
                        bcrypt.hash(data.password, 10)
                        .then( result =>{
                            const newPassword = result;
                            const sql = `update registered_users set password = ? where username = ?`;
                            db.query(sql, [newPassword, user], (err, result)=>{
                                if(err)throw err;
                                console.log(result, 'password changed');
                                res.redirect('/user/profile');
                            })

                        })
                    }else{
                        req.session.msg = 'invalid password';
                        setTimeout(() => {
                            req.session.msg = ''
                        }, 3000);
                        res.redirect('/user/change_password')
                    }
                }else{
                    req.session.msg = ' wrong password';
                    setTimeout(() => {
                        req.session.msg = ''
                    }, 3000);
                    res.redirect('/user/change_password')
                }
            })
        })
    }else{
        //request external
        const email = req.session.email;
        if(data.password === data.rePassword){

            bcrypt.hash(data.password, 10)
            .then( result=>{
                const sql = `update registered_users set password = ? where email = ?`;
                db.query(sql, [result, email], (err, result)=>{
                    if(err)throw err;
                    res.redirect('/login')
                })
            })
        }else{
            const data =  {}
            data.msg = 'passwords not match'
            res.render('ressetpassword',{data})
        }
        const sql =  `select email, password from registered_users where email = ?`;
        db.query(sql, email, (err, result)=>{
           
        })
    }
});

dashboard.post('/forgot_enterMail', (req, res)=>{
    const email = req.body.email;
    const sql = `select * from registered_users where email = ?`;
    db.query(sql, email, (err, result)=>{
        if(err)throw err;
        if(result.length != 0){
            const id = uniqid.time();
            const text =  `
                You have requested to change your password,
                use the link below to proceed..
                ${domain}/user/forgotpassword?id=${id}



                Please ignore this message if you know nothing about it
            `;
            const sql = `insert into change_password (id, email) values (?,?)`;
            db.query(sql, [id, email], (err, result)=>{
                if(err)throw err;
                console.log('sent');
                customMail(email, text);
                setTimeout(() => {
                    const sql = `delete from change_password where id = ?`;
                    db.query(sql, id, (err, result)=>{
                        if(err)throw err;
                        console.log(result, 'timed out delete')
                    })
                }, 60000 * 60 / 2);
                setTimeout(() => {
                    req.session.msg = 'An email has been sent to  you, please continue with the email'
                    res.redirect('/user/forgotpassword');
                    setTimeout(() => {
                        req.session.msg = ''
                    }, 3000);
                }, 3000);
            })


        }else{
            req.session.msg = 'Sorry, No such account with this mail';
            setTimeout(() => {
                req.session.msg = ''
            }, 3000);
            res.redirect('/user/forgotpassword')
        }
    })
});



dashboard.get('/forgotpassword', (req, res)=>{
    const data = {}

    if(req.query.id){
        const id = req.query.id;
        const sql =` select * from change_password where id = ?`;
        db.query(sql, id, (err, result)=>{
            if(err)throw err;
            if(result.length != 0){
                data.email = result[0].email;
                req.session.email = data.email
                res.render('resetpassword', {data});
                setTimeout(() => {
                    const sql = `delete from change_password where id = ?`;
                    db.query(sql, id, (err, result) => {
                        if (err) throw err;
                        console.log(result, 'timed out delete')
                    })
                }, 60000 * 5);
            }else{
                res.redirect('/user/forgotpassword');
            }
        })
    }else{
        data.msg = req.session.msg;
        setTimeout(() => {
            req.session.msg = ''
        }, 3000);
        res.render('forgotpassword', { data });
    }
})
dashboard.use(invest);
dashboard.use(fileUpload);
module.exports = dashboard;

