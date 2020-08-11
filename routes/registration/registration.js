const express = require('express');
const reg = express.Router();
const db = require('../db');
const verifyMailTransporter = require('../mailer');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const auth = require('./auth');
const validate = require('./frontEnd verification/validation');
const bankReg = require('./bank_registration');
reg.use(express.urlencoded({ extended: false }));
const domainName = `http://localhost:3000`;
const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session);

const sessionStore = new MysqlStore({
    clearExpired: true,
    checkExpirationInterval: 60000,
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions'
    }
}, db)
reg.use(session({
    secret: 'networkingNetflix',
    resave: false,
    saveUninitialized: true,
    genid: () => {
        return uuid.v1();
    },
    cookie: {
        // secure: true,
        maxAge: 2160000,

    }
}))
reg.get('/register', (req, res) => {
    // console.log(req.session)
    const data = {};
    data.msg = 'welcome';
    req.query.ref ? data.ref = req.query.ref : data.ref = false;
    res.render('signup', {data});

});

reg.post('/register', (req, res)=>{
    bcrypt.hash(req.body.password, 10).then( hashed =>{
        const data = {
            name: req.body.name,
            email: req.body.email,
            phone_number: req.body.phone_number,
            username: req.body.username,
            referred: req.body.referred,
            password: hashed,
            gen_id: uuid.v4()
        };
        req.session.data = data;
            try {
                db.query(`INSERT INTO ongoing_registration (name, email, phone_number, username, password, gen_id, referred) VALUES ('${data.name}', '${data.email}', '${data.phone_number}', '${data.username}', '${data.password}', '${data.gen_id}', '${data.referred}')`,(err, result) => {
                    const mailing = ()=>{
                        let html = `
                        <p> Please confirm your E-mail by clicking on the link below </p>
                        <a href =' ${domainName}/mail/auth/${data.gen_id}'> Click here </a>

                        <h3> Please ignore this message if you did not initialize it </h3>
                        `;
                        // const render = 'checkmail';


                        verifyMailTransporter.sendMail({
                            
                            from: '"Netflix Networking" <verify@netflixnetworking.com>', // sender address
                            to: data.email, // list of receivers
                            subject: 'Please Verify Your E-mail', // Subject line
                            text: '', // plain text body
                            html: html, // html body
                        }, (err, info) => {
                            if (err) throw err;
                            console.log(info)
                            console.log("Message sent: %s", info.messageId);
                            res.render('checkmail');
                            req.session.email = data.email;

                        });
                    }

                    if(err){
                        console.log(err)
                        if (err.code === 'ER_DUP_ENTRY'){

                            res.render('404')// create a confirm email page proper
                            
                        }// render the registration form again with an error message, pls remember
                    }else{
                        
                        mailing();
                        const deleteQ = `delete from ongoing_registration where gen_id = ?`;
                        setTimeout(() => {
                            db.query(deleteQ, data.gen_id, (err, result) => {
                                if (err){
                                    if (err.code === 'ER_BAD_FIELD_ERROR'){
                                        //user confirmed aready so do nothing
                                    }else{
                                        throw err
                                    }
                                };
                                console.log(result, 'deleted')
                            })
                        }, 60000 * 60);
                         
                    }
                })
                
            }catch (error) {
               console.log(error)
            }

    });
    reg.get('/remail', (req, res)=>{
        const data = req.session.data;
        let html = `
                        <p> Please confirm your E-mail by clicking on the link below </p>
                        <a href =' ${domainName}/mail/auth/${data.gen_id}'> Click here </a>

                        <h3> Please ignore this message if you did not initialize it </h3>
                        `;
        verifyMailTransporter.sendMail({
            from: '"Netflix Networking" <verify@netflixnetworking.com>', // sender address
            to: data.email, // list of receivers
            subject: 'Please Verify Your E-mail', // Subject line
            text: '', // plain text body
            html: html, // html body
        }, (err, info) => {
            if (err) throw err;
            console.log(info)
            console.log("Message sent: %s", info.messageId);
            res.render('checkmail');
            

        });
        
    })
});
reg.use('/bank',bankReg);
reg.use('/mail', auth);
reg.use(validate)





// console.log(uuid.v1())
// reg.use(express.json());
module.exports = reg;