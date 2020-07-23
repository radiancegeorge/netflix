const express = require('express');
// const open = require('open')
const cors = require('cors');
const reload = require('reload')
const app = express();
const registration = require('./routes/registration/registration');
const reg = require('./routes/registration/registration');
app.set('view engine', 'ejs');
const login = require('./routes/login/login')
app.use(cors());
const user_dashboard = require('./routes/dashboard_users/user_dashboard')

// app.get('/dashboard', (req, res)=>{
    
//         res.send('<a href="/logout"> logout </a>')
   
// })

app.use('/user', user_dashboard)
app.use(registration)
app.use(login)
app.use(express.static('public'));
reload(app).then(()=>{
    app.listen(3000,/* open('http:localhost:3000/', {app: 'chrome'})*/ )
}).catch(err =>{
    if(err)throw err;
})
