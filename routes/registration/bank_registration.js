const express =  require('express');
const bankReg = express.Router();
const personalDb = require('../personalDb')
const Paystack = require('paystack-node');
const paystack = new Paystack('sk_test_e85eda640ef1d5391c3b79c017c96b4235c4c9c1')
const db = require('../db');
const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session);
const uuid = require('uuid').v1;
const refDb = require('../referralsDb');
const notifDb = require('../notifDb')

const sessionStore = new MysqlStore({
    clearExpired: true,
    checkExpirationInterval: 60000,
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions'
    }
}, db)
bankReg.use(session({
    secret: 'networkingNetflix',
    resave: false,
    saveUninitialized: true,
    genid: () => {
        return uuid();
    },
    cookie: {
        // secure: true,
        maxAge: 2160000,

    }
}))



// paystack.listBanks({
//     perPage: 50
// }).then( response =>{
//     console.log(response.body.data)
// })

bankReg.get('/', (req, res)=>{
    // console.log(req.session)
    paystack.listBanks({
        perPage: 50,
        country: 'nigeria',
    }).then( response =>{
        // console.log(response);
        if(response.body.status === true){
            const data = response.body.data;
            //making all banks available for further use throughout the request
            req.session.allBanks = data
            // now render the bank registration page with banks in the select tag
            const msg = req.session.msg;
            res.render('bank_verification', {data, msg})
        }
    }).catch(err =>{
        if(err) console.log(err)
    })
});
bankReg.get('/user/:account_number/:bank_code', (req, res)=>{
    console.log(req.params)
      paystack.resolveAccountNumber({
          account_number: req.params.account_number,
          bank_code: req.params.bank_code
      }).then( response =>{
          if(response.body.status === true){
                const allBanks = req.session.allBanks;
                const selectedBank = allBanks.filter(bank => {
                    if(bank.code == req.params.bank_code){
                        return bank;
                    }
                });
                
                // console.log(allBanks)
              const data = response.body.data;
                delete data.bank_id
              data.bank_name = selectedBank[0].name
              console.log(data)
              req.session.accountDetails = data
                res.status(201).send(data.account_name)
          }
      }) .catch(error =>{
          console.log(error)
      }) 

});


bankReg.get('/update_bank_details', (req, res)=>{
    const email = req.session.email,
    account_details = req.session.accountDetails,
        sql = `update registered_users set ? where email = '${email}' `;
        console.log(account_details, email)
    db.query(sql, account_details, (err, response)=>{
        if(err)throw err;
        const data = {};
        //using email, find users username;
        const sql = `select username from registered_users where email = ?`
        db.query(sql, email, (err, result)=>{
            if(err)throw err;
            data.username = result[0].username
            data.transaction_id = 'transaction_id varchar(255) not null unique primary key';
            data.amount_paid = 'amount_paid varchar(255) not null'
            data.amount_recieved = 'amount_recieved varchar(255) not null'
            const sql = `create table ${data.username} (${data.transaction_id}, ${data.amount_paid}, ${data.amount_recieved})`;
            personalDb.query(sql, (err, result)=>{
                if(err)throw err;
                console.log(result);
                const sql = `create table ${data.username} (id int auto_increment primary key, username varchar(45) not null unique, investment varchar(255) null, amount varchar(255) null, transaction_id varchar(45) null)`;
                refDb.query(sql, (err, result)=>{
                    if(err)throw err;
                    console.log(result, 'ref data initiated');
                    req.session.regEmail = data.username;
                    // console.log(email, req.session.email);
                    //create notif table
                    const sql = `create table ${data.username} (id int auto_increment primary key, username varchar(45) not null, file_name varchar(255) not null, previous_count int not null)`;
                    notifDb.query(sql, (err, result)=>{
                        if(err)throw err;
                        res.status(200).redirect('/user/dashboard')// remember to redirect to the dashboard

                    })
                })
                
            })
        })
        

        
    })
})
// bankReg.use(express.urlencoded({extended: false}));




module.exports = bankReg;