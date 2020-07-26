const express =  require('express');
const dashboard = express.Router();
const db = require('../db');

dashboard.get('/dashboard', (req, res)=>{
    console.log(req.session.username)
    if(req.session.username || req.app.locals.regEmail){
        const data = req.app.locals.regEmail || req.session.username;
        req.session.username = data;
        const sql = `select * from activated_users where email = ?`;
        db.query(sql, data, (err, result)=>{
            if(err)throw err;
            result.length < 1 ? data.activated = false : data.activated = true;
            res.render('user_dashboard', { data });
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
    res.render('dashboard_home')
})

module.exports = dashboard;