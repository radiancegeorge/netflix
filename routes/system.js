

const db = require('./db'),
awaiting = require('./awaitingDb'),
personalDb = require('./personalDb'),
customMail = require('./customMail'),
checkDate = require('./system2'),
ref = require('./system3');
const invest = require('./dashboard_users/invest');

 

const system = ()=>{

const sql = `select * from to_pay`;
db.query(sql, (err, result)=>{
    if(err)throw err;
    if(result.length != 0){
        //get users with incomplete transaction;
        const promise = new Promise((resolve, reject)=>{
            const data = [];
            result.forEach(item =>{
                if(Number(item.amount) != 0){
                    data.push(item)
                }
            });
            setTimeout(() => {
                resolve(data)
            }, 3000);
        });
        promise.then(result=>{
            if(result.length != 0){
                const investor = result[0];
                console.log(investor, 'found an investor');
                // const investor = {};
                // investor.username = data.username
                // investor.amount = data.amount;
                // investor.id = data.id;

                const sql = `select * from awaiting_payment`;
                db.query(sql, (err, result)=>{
                    if(err)throw err;
                    if(result.length != 0){
                        const promise = new Promise((resolve, reject)=>{
                            const data = []
                            result.forEach(item=>{

                                if(Number(item.amount_recieved) < Number(item.amount_to_be_recieved)){
                                    data.push(item)
                                }
                            });
                            setTimeout(() => {
                                resolve(data)
                            }, 2000);
                        });
                        promise.then(result=>{
                            console.log(result, 'for recievers');
                            const reciever = result[0];
                            if((Number(investor.amount) + Number(reciever.amount_recieved) <= Number(reciever.amount_to_be_recieved))){
                                console.log(reciever.amount_recieved);
                                reciever.amount_recieved = Number(investor.amount) + Number(reciever.amount_recieved);
                                console.log(reciever.amount_recieved, investor.amount);
                                const update =  `update to_pay set amount = ? where username = ?`;
                                db.query(update, [0, investor.username], (err, result)=>{
                                    if(err)throw err;
                                    const updateReciever = `update awaiting_payment set amount_recieved = ? where username = ?`;
                                    db.query(updateReciever, [reciever.amount_recieved, reciever.username], (err, result)=>{
                                        if(err)throw err;
                                        const sql = `insert into ${reciever.username} (id, username, amount, date, status) values (?,?,?,?,?)`;
                                        awaiting.query(sql, [investor.id, investor.username, investor.amount, new Date(), 'not paid'], (err, result)=>{
                                            if(err)throw err;
                                            console.log(result, 'inserted details into awaiting db')
                                        } )
                                    })
                                })
                            } else if ((Number(investor.amount) + Number(reciever.amount_recieved) > Number(reciever.amount_to_be_recieved))){
                                //get remaining
                                const remainder = Number(reciever.amount_to_be_recieved) - Number(reciever.amount_recieved);
                                investor.remaining = Number(investor.amount) - remainder;
                                reciever.amount_recieved = Number(reciever.amount_recieved) + remainder;
                                //update to pay table;
                                // console.log(investor.remaining, reciever.amount_recieved,remainder,'last phase')
                                const update = `update to_pay set amount = ? where username = ?`;
                                db.query(update, [investor.remaining, investor.username], (err, result)=>{
                                    if(err)throw err;
                                    //update awaiting table
                                    const updateReciever = `update awaiting_payment set amount_recieved = ? where username = ?`;
                                    db.query(updateReciever, [reciever.amount_recieved, reciever.username], (err, result)=>{
                                        if(err)throw err;
                                        const sql = `insert into ${reciever.username} (id, username, amount, date, status) values (?,?,?,?,?)`;
                                        awaiting.query(sql, [investor.id, investor.username, remainder, new Date(), 'not paid'], (err, result)=>{
                                            if(err)throw err;
                                            console.log(result, 'added to recievers awaiting db')
                                        })
                                    })

                                })
                            }
                        })
                    }
                })
            }
        })
    }
})










    // const sql = `select username from to_pay where amount > ?`;
    // db.query(sql, 0, (err, result)=>{
    //     if(err)throw err;
    //     console.log(result, 'users with incomplete transactions')
    //     const investors = result;
    //     //try getting recievers with incomplete amount recieved;
    //     investors.forEach(investor => {
    //         const sql = `select * from awaiting_payment`;
    //         db.query(sql, (err, result) => {
    //             if (err) throw err;
    //             if (result.length != 0) {
    //                 result = result.filter(item => {
    //                     // console.log(item.amount_to_be_recieved, 'these are items')
    //                     if (Number(item.amount_recieved) < Number(item.amount_to_be_recieved)) {
    //                         console.log('true')
    //                         return item
    //                     }
    //                 })

    //                 console.log(result, 'recievers with incomplete merge');
    //                 const reciever = result[0];

    //                 const user = investor.username;
    //                 // recievers.forEach(person => {
    //                 const sql = `select * from to_pay where username = ? and amount <> 0`
    //                 db.query(sql, user, (err, result) => {
    //                     if (err) throw err;
    //                     //## check lenght and make sure it isn't 0
    //                     if (result.length != 0) {
    //                         const id = result[0].id
    //                         const amount = Number(result[0].amount);
    //                         const amountRecieved = Number(reciever.amount_recieved)
    //                         const amountToBeRecieved = Number(reciever.amount_to_be_recieved)
    //                         if (amount + amountRecieved > amountToBeRecieved && amount != 0) {
    //                             const notification = 'Hello!! You have been merged to pay someone'
    //                             const message = 'HELLO!! you have been merged to recieve payment'
    //                             //get what is remaining to complete this users transaction from the investor;
    //                             const remaining = amountToBeRecieved - amountRecieved;
    //                             //what will be left of the investors money
    //                             const investorsRemaining = amount - remaining;
    //                             const newRecieved = remaining + amountRecieved;
    //                             //add to the recievers recieved amount;
    //                             const sql = `update awaiting_payment set amount_recieved = ? where username = '${reciever.username}' `;
    //                             db.query(sql, newRecieved, (err, result) => {
    //                                 if (err) throw err;
    //                                 console.log(result, 'updated amount in awaiting_table');
    //                                 //send investors data to recievers awaiting table;
    //                                 const sql = `insert into ${reciever.username} (id, username, amount, date, status) values (?,?,?,?,?)`;
    //                                 awaiting.query(sql, [id, user, remaining, new Date(), 'not paid'], (err, result) => {
    //                                     if (err) {
    //                                         if (err.code === 'ER_DUP_ENTRY') {
    //                                             console.log(err)
    //                                         } else {
    //                                             throw err;
    //                                         }
    //                                     };
    //                                     console.log('inserted into recievers personal table');
    //                                     //update investors amount
    //                                     const sql = `update to_pay set amount = ${investorsRemaining} where username = ?`;
    //                                     db.query(sql, user, (err, result) => {
    //                                         if (err) throw err;
    //                                         // current balance updated
    //                                         const sql = `select email from registered_users where username = ?`;
    //                                         db.query(sql, reciever.username, (err, result) => {
    //                                             if (err) throw err;
    //                                             result = result[0].email;
    //                                             customMail(result, message);
    //                                             //send message to the investor also;
    //                                             const sql = `select email from registered_users where username = ?`
    //                                             db.query(sql, user, (err, result) => {
    //                                                 if (err) throw err;
    //                                                 result = result[0].email;
    //                                                 customMail(result, notification);
    //                                             })

    //                                         })
    //                                     })
    //                                 })
    //                             });


    //                         } else if (amount + amountRecieved <= amountToBeRecieved && amount != 0) {
    //                             const notification = 'Hello!! You have been merged to pay someone'
    //                             const message = 'HELLO!! you have been merged to recieve payment'
    //                             const sql = `insert into ${reciever.username} (id, username, amount, date, status) values (?,?,?,?,?)`;
    //                             awaiting.query(sql, [id, user, amount, new Date(), 'not paid'], (err, result) => {
    //                                 if (err) throw err;
    //                                 console.log('inserted into recievers personal table');
    //                                 //update investors amount and recievers recieved;
    //                                 const amountRecievedUpdate = amount + amountRecieved;

    //                                 const sql = `update awaiting_payment set amount_recieved = ?  where username = ?`;
    //                                 db.query(sql, [amountRecievedUpdate, reciever.username], (err, result) => {
    //                                     if (err) throw err;
    //                                     console.log(result, 'recievers updated')
    //                                     const sql = `update to_pay set amount = ${0} where username = ?`;
    //                                     db.query(sql, user, (err, result) => {
    //                                         if (err) throw err;
    //                                         //get details and try to send a mail;

    //                                         const sql = `select email from registered_users where username = ?`;
    //                                         db.query(sql, reciever.username, (err, result) => {
    //                                             if (err) throw err;
    //                                             result = result[0].email;
    //                                             console.log(result, 'mail to')
    //                                             customMail(result, message);
    //                                             //send message to the investor also;
    //                                             const sql = `select email from registered_users where username = ?`
    //                                             db.query(sql, user, (err, result) => {
    //                                                 if (err) throw err;
    //                                                 result = result[0].email;
    //                                                 customMail(result, notification);
    //                                             })

    //                                         })
    //                                     })
    //                                 })

    //                             })
    //                         } else {
    //                             //
    //                         }
    //                     }

    //                 })
    //         // });
    //             }











    //         })
            

    //     })







        

    // });


    //check for complete transactions on recievers;
    //check recievers in awaiting table with amount to be recieved = amount recieved;
    const rsql = `select * from awaiting_payment where amount_to_be_recieved = amount_recieved`;
    db.query(rsql, (err, result)=>{
        if(err)throw err;
        if(result.length >= 1){
            const possibleRecievers = result;
            //check personalDb to know if the reciever is really done recieving;
            possibleRecievers.forEach(reciever => {
                const user = reciever.username;
                const transaction_id = reciever.transaction_id;
                const amountToBeRecieved = Number(reciever.amount_to_be_recieved);
                const sql = `select * from ${user} where transaction_id = ?`;
                personalDb.query(sql, transaction_id, (err, result) => {
                    if (err) throw err;
                    if(result.length === 1){
                        const amountRecieved = Number(result[0].amount_recieved);
                        if(amountRecieved === amountToBeRecieved){
                            //a match so empty drop table in awaiting database and clear log from awaiting table;
                            const sql = `delete from awaiting_payment where username = ?`
                            //######
                            db.query(sql, user, (err, result)=>{
                                if(err)throw err;
                                console.log(result,'reciever deleted');
                                // drop table in awaiting db if now empty;
                                const amend = `select * from ${user}`;
                                awaiting.query(amend, (err, result)=>{
                                    if(err)throw err;
                                    if(result.length < 1){
                                        const sql = `drop table ${user}`;
                                        awaiting.query(sql, (err, result) => {
                                            if (err) throw err;
                                            console.log(result, 'table in awaiting dropped')
                                        })
                                    }
                                })
                                
                            })
                        }
                    }else{
                        //empty
                    }
                })

            });
        }else{
            //empty
        }
        
    });
    // checkDate()
};

setInterval(() => {
    system();
}, 10000);
module.exports = system;

