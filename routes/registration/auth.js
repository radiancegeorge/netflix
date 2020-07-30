const express = require('express');
const auth = express.Router();
const db = require('../db')



auth.get('/auth/:id', (req, res)=>{
    const id = req.params.id;
    let sql = `SELECT * FROM ongoing_registration WHERE gen_id = ?`;
    try{
        db.query(sql, id, (err, result)=>{
            if(err) throw err;
            // console.log(result)
            if(result.length === 1){
                const date = new Date()
                const data = [result[0].name, result[0].username, result[0].password, result[0].email, result[0].phone_number, result[0].reffered, date];
                let sql = `INSERT INTO registered_users (name, username, password, email, phone_number, referred, timeout) values (?, ?, ?, ?, ?, ?, ?)`
                db.query(sql, data, (err, result) => {
                    if(err)throw err;
                    let sql = `DELETE FROM ongoing_registration WHERE gen_id = ?`;
                    db.query(sql, id, (err, result)=>{
                        if(err)throw err;
                        // console.log(result);
                        req.app.locals.email = data[3];
                        // console.log(req.app.locals.email, 'this is the email', data[3])
                        req.app.locals.msg = 'Your account has been created successfully!!'
                        res.redirect('/bank');
                    });
                });
            }else if(result.length < 1){
                res.status(404).render('404')
            }
        })
    } catch(error){

    }
});
module.exports = auth;