const db = require('./db'),
awaiting = require('./awaitingDb'),
personalDb = require('./personalDb');
const invest = require('./dashboard_users/invest');


const checkDate = ()=>{

    const sql = `show tables`;
    awaiting.query(sql, (err, result)=>{
        if(err)throw err;
        const tables = result;
        if(tables.length != 0){
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
                                const currentDate = Date.now(),
                                investorDate = new Date(investor.date).getTime(),
                                timeLeft = currentDate - investorDate,
                                hoursLeft = timeLeft / 82800000;
                                if(hoursLeft >= 24){
                                    //time elapsed
                                }
                                
                                
                            })
                        }
                        
                        
                    })
                })
            })
        }
    })
    

};
checkDate()
module.exports = checkDate;