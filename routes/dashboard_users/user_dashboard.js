const express =  require('express');
const dashboard = express.Router();
const db = require('../db');
const invest = require('./invest')

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
                    //founding nothing in awaiting payment also; so render home with ability to commence transaction;
                    data.initialization = true;
                    res.render('dashboard_home', {data})
                }else if(result.length === 1){
                    //found in payment, then go back to to_pay and see if the system has anyone to pay this individual;
                    const sql = 'select * from to_pay where reciever = ?';
                    db.query(sql, user, (err, result)=>{
                        if(err)throw err;
                        if(result.length < 1){
                            // nobody to pay yet.. do something about it later;
                            data.nobody = true;
                            res.render('dashboard_home', {data});
                        }else{
                            //people to pay to this user found... now render persons details to this user;
                            data.payers = result;
                            res.render('dashboard_home')
                        }
                    })
                }
            })
        }else if(result.length === 1){
            //found him in pay_to table, now render who he is to pay to**** details
            result = result[0];
            const reciever = result.reciever;
            const sql = `select username,phone_number, account_name, account_number, bank_name from registered_users where username = ?`;
            db.query(sql, reciever, (err, result)=>{
                if(err)throw err;
                data.reciever = result[0];
                res.render('dashboard_home',{data})
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
dashboard.use(invest)
module.exports = dashboard;