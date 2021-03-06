//referral operations
const refDb = require('./referralsDb'),
personalDb = require('./personalDb'),
awaiting = require('./awaitingDb'),
db = require('./db');

const referrals = ()=>{
    const sql = `select * from registered_users where referred is not null`;
    db.query(sql, (err, result)=>{
        if(err)throw err;
        if(result.length != 0){
            const allReferred = result;
            allReferred.forEach(person =>{
                const referred = person.username;
                const user = person.referred;
                // console.log({referred, user}, 'referred detail');
                const sql = `select username from ${user} where username = ?`;
                refDb.query(sql, referred, (err, result)=>{
                    if(err){
                        if (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_PARSE_ERROR'){
                            console.log('no such table')
                        }else{
                            throw err;
                        };
                    }else{
                        // console.log(result, 'they say not defined')
                        if (result.length === 0) {
                            console.log('no user, attempting insert');
                            const sql = `insert into ${user} (username) values (?)`;
                            refDb.query(sql, referred, (err, result) => {
                                if (err) throw err;
                                console.log('inserted successfully!')
                            })
                        } else {
                            //user already exists, so do nothing
                            console.log('user already exist');
                        };
                    };
                    

                });
            });
        };
    });

    //looking out for first investments;;
    refDb.query('show tables', (err, result)=>{
        if(err)throw err;
        if(result.length != 0){
            const tables = result;
            //try get every user from table;
            tables.forEach( table=>{
                const user = table.Tables_in_netftgvf_referrals;
                //found tables;
                const sql =`select * from ${user}`;
                refDb.query(sql, (err, result)=>{
                    if(err)throw err;
                    if(result.length != 0){
                        const allReferred = result;
                        allReferred.forEach(person=>{
                            const referred = person.username;
                            if(person.amount === null){
                                const sql = `select * from ${referred}`;
                                personalDb.query(sql, (err, result) => {
                                    if (err){
                                        // console.log(err)
                                    }else{
                                        if (result.length === 1) {
                                            const transaction_id = result[0].transaction_id,
                                                amount_paid = Number(result[0].amount_paid),
                                                //attempting to find transaction in to_pay to know if its still ongoing or done
                                                sql = `select * from to_pay where id = ?`;
                                            db.query(sql, transaction_id, (err, result) => {
                                                if (err) throw err;
                                                if (result.length < 1) {
                                                    //completed transaction;
                                                    //add update user;
                                                    const amount = (amount_paid * 5) / 100;
                                                    const sql = `update ${user} set transaction_id = ?, investment = ?, amount = ? where username = ?`;
                                                    refDb.query(sql, [transaction_id, amount_paid, amount, referred], (err, result) => {
                                                        if (err) throw err;
                                                        //succesfully updated;
                                                        console.log('updated first transaction')
                                                    })
                                                } else {
                                                    //still ongoing transaction
                                                    console.log(result, 'still an ongoing transaction');
                                                }
                                            })
                                        }
                                    } /*throw err;*/
                                    
                                })
                            }else{
                                console.log('already assigned first investment');
                            }
                        })
                    }
                })
            })
        }else{
            console.log('empty')
        }
    });
    //guide section;
    refDb.query('show tables', (err, result)=>{
        if(err)throw err;
        if(result.length != 0){
            result.forEach(person =>{
                const user = person.Tables_in_netftgvf_referrals;
                const sql = `select * from ${user} where amount is not null`;
                refDb.query(sql, (err, result)=>{
                    if(err)throw err;
                    if(result.length >= 15){
                        const allReferred = result;
                        allReferred.forEach(referred =>{
                            const referredName = referred.username
                            const id = referred.transaction_id;
                            const amount = Number(referred.amount);
                            const sql = `select * from ${referredName}`;
                            personalDb.query(sql, (err, result)=>{
                                if(err)throw err;
                                if(result.length != 0){
                                    const targetTransaction = result[result.length - 1];
                                    if(targetTransaction.transaction_id != id){
                                        //checking to_pay to confirm if its a finished transaction;;
                                        const sql = `select * from to_pay where id = ?`;
                                        db.query(sql, targetTransaction.transaction_id, (err, result)=>{
                                            if(err)throw err;
                                            if(result.length === 0){
                                                //found nothing, meaning its a done transaction;
                                                const invested = Number(targetTransaction.amount_paid);
                                                const newAmount = (invested * 1 / 100) + amount;
                                                //update the refdb
                                                const sql = `update ${user} set transaction_id = ?, amount = ?, investment = ? where username = ?`;
                                                refDb.query(sql, [targetTransaction.transaction_id, newAmount, invested, referredName], (err, result)=>{
                                                    if(err)throw err;
                                                    console.log(result, 'guide updated')
                                                })
                                            }
                                        })
                                    }
                                }
                            })
                        })
                    }
                })
            })
        }
    })
};
setInterval(() => {
    referrals()
}, 10000);
module.exports = referrals