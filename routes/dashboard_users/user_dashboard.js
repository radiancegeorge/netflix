const express =  require('express');
const dashboard = express.Router();

dashboard.get('/dashboard', (req, res)=>{
    res.render('user_dashboard');
})

module.exports = dashboard;