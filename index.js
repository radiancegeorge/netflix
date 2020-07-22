const express = require('express');
// const open = require('open')
const cors = require('cors')
const app = express();
const registration = require('./routes/registration/registration');
const reg = require('./routes/registration/registration');
app.set('view engine', 'ejs');
const login = require('./routes/login/login')
app.use(cors());

app.get('/dashboard', (req, res)=>{
    
        res.send('dashboard')
   
})


app.use(registration)
app.use(login)
app.use(express.static('public'))
app.listen(3000,/* open('http:localhost:3000/', {app: 'chrome'})*/ )