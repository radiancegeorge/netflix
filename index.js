const express = require('express');
// const open = require('open')
const app = express();
const registration = require('./routes/registration/registration');
const reg = require('./routes/registration/registration');
app.set('view engine', 'ejs');



app.use(express.static('public/'))
app.use(registration)
app.listen(3000,/* open('http:localhost:3000/', {app: 'chrome'})*/ )