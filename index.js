const express = require('express');
// const open = require('open')
const cors = require('cors');
// const reload = require('reload')
const app = express();
const registration = require('./routes/registration/registration');
const reg = require('./routes/registration/registration');
app.set('view engine', 'ejs');
const login = require('./routes/login/login')
app.use(cors());
const admin = require('./routes/admin/admin')
const validate = require('./routes/payment validation/validatePayment')
// const personalDb = require('./routes/personalDb');

app.use(validate)

app.use('/admin',admin);
// app.get('/dashboard', (req, res)=>{
    
//         res.send('<a href="/logout"> logout </a>')
   
// })

// app.use('/user', user_dashboard)
app.use(registration)
app.use(login)
app.use(express.static('public'));

app.listen(3000,/* open('http:localhost:3000/', {app: 'chrome'})*/ )

