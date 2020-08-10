const db = require('./db'),
awaiting = require('./awaitingDb'),
// personalDb = require('./personalDb'),
customMail = require('./customMail');
// const invest = require('./dashboard_users/invest');


const checkDate = ()=>{

    const sql = `show tables`;
    awaiting.query(sql, (err, result)=>{
        if(err)throw err;
        const tables = result;
        if(tables.length != 0){
            console.log(result,'in search of expired transactions')
            //found users now attempt getting every investor;
            const promise = new Promise((resolve, reject)=>{
                const data = [];
                tables.forEach(table =>{
                    const reciever = table.Tables_in_netftgvf_awaiting_payment;
                    const sql = `select * from ${reciever}`;
                    awaiting.query(sql, (err, result)=>{
                        if(err)throw err;
                        //every user gotten, now to select those with expired dates;
                        const investors = result;
                        if(investors.length != 0){
                            investors.forEach(investor =>{
                                const currentDate =new Date(),
                                investorDate = new Date(investor.date),
                                timeLeft = currentDate - investorDate,
                                // hoursLeft = 25
                                hoursLeft = timeLeft / 3600000;
                                console.log(hoursLeft)
                                if(hoursLeft >= 17){
                                    //time elapsed transfer and reset data then block user;
                                    const sql = `delete from activated_users where username = ?`;
                                    db.query(sql, investor.username, (err, result)=>{
                                        if(err)throw err;
                                        console.log(result, ' user has been removed from activated users');
                                        awaiting.query('show tables', (err, result)=>{
                                            if(err)throw err;
                                            const tables = result;
                                            if(tables.length != 0){
                                                tables.forEach( table =>{
                                                    const reciever2 = table.Tables_in_netftgvf_awaiting_payment;
                                                    console.log(reciever2, 'this is the reciever')
                                                    const sql =`select * from ${reciever2} where username = ?`;
                                                    awaiting.query(sql, investor.username, (err, result)=>{
                                                        if(err)throw err;
                                                        console.log(result, 'this are investors in recievers table')
            
                                                        if(result.length === 1){
                                                            const investor = result[0];

                                                            //transfer and delete record;
                                                            const amount = investor.amount;
                                                            //get recievers recieved amount;
                                                            const sql = `select amount_recieved from awaiting_payment where username = ?`;
                                                            db.query(sql, reciever2, (err, result)=>{
                                                                if(err)throw err;
                                                                if(result.length === 1){
                                                                    const receiverAmount = result[0].amount_recieved 
                                                                    const newAmount = receiverAmount - amount;
                                                                    //update new amount and delete user from to_pay;

                                                                    const sql = `update awaiting_payment set amount_recieved = ? where username = ?`;
                                                                    db.query(sql, [newAmount, reciever], (err, result)=>{
                                                                        if(err)throw err;
                                                                        console.log(result, 'receivers amount updated');
                                                                        //delete user from to_pay and finally from receiver;
                                                                        const sql = `delete from to_pay where username = ?`;
                                                                        db.query(sql, investor.username, (err, result)=>{
                                                                            //### patch
                                                                            if(err){
                                                                                console.log('deleted previously from to pay')
                                                                            }
                                                                            console.log(result, 'investor deleted from to_pay');
                                                                            const sql = `delete from ${reciever} where username = ?`;
                                                                            awaiting.query(sql, investor.username, (err, result)=>{
                                                                                if(err)throw err;
                                                                                console.log(result, 'deleted user from awaiting database');
                                                                                //send mail
                                                                                const sql = `select email from registered_users where username = ?`;
                                                                                db.query(sql, investor.username, (err, result)=>{
                                                                                    if(err)throw err;
                                                                                    const text = ' You have been suspended for failure to complete investment within the specified time',
                                                                                        email = result[0].email
                                                                                    customMail(email, text)
                                                                                })
                                                                            })

                                                                        })
                                                                    })

                                                                }
                                                            })
                                                        }
                                                    })
                                                })
                                            }
                                        })
                                    })
                                }
                                
                                
                            })
                        }
                        
                        
                    })
                });
                setTimeout(() => {
                    resolve('all done')
                }, 10000);
            });
            
            promise.then(result => {
                console.log(result)
            })
            
        }
    })
    

};
setInterval(() => {
checkDate()

}, 20000);
module.exports = checkDate;