const express =  require('express');
const bankReg = express.Router();
const Paystack = require('paystack-node');
const paystack = new Paystack('sk_test_e85eda640ef1d5391c3b79c017c96b4235c4c9c1')
const db = require('../db');
const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session);
const uuid = require('uuid').v1

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
        maxAge: 86400000,

    }
}))



// paystack.listBanks({
//     perPage: 50
// }).then( response =>{
//     console.log(response.body.data)
// })

bankReg.get('/', (req, res)=>{
    paystack.listBanks({
        perPage: 50,
        country: 'nigeria',
    }).then( response =>{
        // console.log(response);
        if(response.body.status === true){
            const data = response.body.data;
            //making all banks available for further use throughout the request
            req.app.locals.allBanks = data
            // now render the bank registration page with banks in the select tag
            const msg = req.app.locals.msg;
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
                const allBanks = req.app.locals.allBanks;
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
              req.app.locals.accountDetails = data
                res.status(201).send(data.account_name)
          }
      }) .catch(error =>{
          console.log(error)
      }) 

});


bankReg.get('/update_bank_details', (req, res)=>{
    const email = req.app.locals.email,
    account_details = req.app.locals.accountDetails,
        sql = `update registered_users set ? where email = '${email}' `;
        console.log(account_details, email)
    db.query(sql, account_details, (err, response)=>{
        if(err)throw err;
        req.app.locals.regEmail = email;
        // console.log(email, req.session.email)
        res.status(200).redirect('/user/dashboard')// remember to redirect to the dashboard
    })
})
// bankReg.use(express.urlencoded({extended: false}));
module.exports = bankReg;