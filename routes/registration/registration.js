const express = require('express');
const reg = express.Router();
reg.use(express.urlencoded({extended: false}));
const db = require('../db');
const sendMail = require('../mailer');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const auth = require('./auth');


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
            reffered: req.body.reffered,
            password: hashed,
            gen_id: uuid.v4()
        };
            try {
                db.query(`INSERT INTO ongoing_registration (name, email, phone_number, username, password, gen_id, reffered) VALUES ('${data.name}', '${data.email}', '${data.phone_number}', '${data.username}', '${data.password}', '${data.gen_id}', '${data.reffered}')`,(err, result) => {
                    if(err){
                        // console.log(err)
                        if (err.code === 'ER_DUP_ENTRY'){
                            res.send('please confirm your E-mail')
                        }
                    }else{
                        let html = `
                <p> Please confirm your E-mail by clicking on the link below </p>
                <a href =' http://localhost:3000/mail/auth/${data.gen_id}'> Click here </a>

                <h3> Please ignore this message if you did not innitialize it </h3>
            `
                        sendMail(data.email, 'Confirm your E-mail address', `Please confirm your email address http://localhost:3000/mail/auth/${data.gen_id}`, html);
                        res.send('please check your email for confirmation')

                    }
            })
                
            } catch (error) {
                console.log(error)
            }
           
       
    });
    
});
reg.use('/mail', auth);

module.exports = reg;