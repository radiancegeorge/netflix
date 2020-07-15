const express = require('express');
const validate = express.Router();
const db = require('../../db');


// this section is mainly for the front end validation process

validate.get('/validate/:property/:value', (req, res)=>{
    const property = req.params.property;
    const value = req.params.value;
    const sql = `select * from registered_users where ${property} = '${value}' `;
    db.query(sql, (err, result)=>{
        if(err) throw err;
        // console.log(result);
        if(result.length < 1){
            res.status(200).send()
        }else{
            res.status(409).send();
        }
    })
})

module.exports = validate