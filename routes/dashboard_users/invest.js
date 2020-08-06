const express = require('express');
const invest = express.Router();
const db = require('../db');
const personalDb = require('../personalDb');

invest.post('/invest',(req, res)=>{
    const amount = req.body.amount;

})


module.exports = invest;