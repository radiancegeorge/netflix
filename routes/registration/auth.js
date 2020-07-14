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
                const data = [result[0].name, result[0].username, result[0].password, result[0].email, result[0].phone_number, result[0].reffered];
                let sql = `INSERT INTO registered_users (name, username, password, email, phone_number, referred) values (?, ?, ?, ?, ?, ?)`
                db.query(sql, data, (err, result) => {
                    if(err)throw err;
                    let sql = `DELETE FROM ongoing_registration WHERE gen_id = ?`;
                    db.query(sql, id, (err, result)=>{
                        if(err)throw err;
                        // console.log(result);
                        res.send('registered');
                    });
                });
            }else if(result.length < 1){
                res.status(404).send()
            }
        })
    } catch(error){

    }
});
module.exports = auth;