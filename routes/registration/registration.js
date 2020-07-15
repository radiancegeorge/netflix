const express = require('express');
const reg = express.Router();
const db = require('../db');
const sendMail = require('../mailer');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const auth = require('./auth');
const validate = require('./frontEnd verification/validation')

reg.get('/register', (req, res)=>{
    res.render('register')
})
reg.post('/register', (req, res)=>{
    bcrypt.hash(req.body.password, 10).then( hashed =>{
        const data = {
            name: req.body.name,
            email: req.body.email,
            phone_number: Number(req.body.phone_number),
            username: req.body.username,
            referred: req.body.referred,
            password: hashed,
            gen_id: uuid.v4()
        };
            try {
                db.query(`INSERT INTO ongoing_registration (name, email, phone_number, username, password, gen_id, referred) VALUES ('${data.name}', '${data.email}', '${data.phone_number}', '${data.username}', '${data.password}', '${data.gen_id}', '${data.reffered}')`,(err, result) => {
                    if(err){
                        console.log(err)
                        if (err.code === 'ER_DUP_ENTRY'){
                            res.send('please confirm your E-mail')// create a confirm email page proper
                        }// render the registration form again with an error message, pls remember
                    }else{
                        let html = `
                <p> Please confirm your E-mail by clicking on the link below </p>
                <a href =' http://localhost:3000/mail/auth/${data.gen_id}'> Click here </a>

                <h3> Please ignore this message if you did not innitialize it </h3>
            `
                        sendMail(data.email, 'Confirm your E-mail address', `Please confirm your email address http://localhost:3000/mail/auth/${data.gen_id}`, html);
                        setTimeout(() => {
                            res.send('please check your email for confirmation')
                        }, 3000); 
                    }
            })
                
            } catch (error) {
                console.log(error)
            }
           
       
    });
    
});
reg.use('/mail', auth);
reg.use(validate)






reg.use(express.urlencoded({ extended: false }));
reg.use(express.json());
module.exports = reg;