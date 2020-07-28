const express = require('express');
const admin = express.Router();
const db = require('../db');
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
})
module.exports = admin;