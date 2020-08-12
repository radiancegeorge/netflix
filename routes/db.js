const mysql = require('mysql');

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'netftgvf_admin',
    password: 'netflixnetworking',
    database: 'netftgvf_netflix_networking',
});

db.connect(()=>{
    console.log('connected to database')
});
const ls = (sql, data)=>{
    q = sql;
    db.query(q, data, (err, result)=>{
        // if(err)throw err;
        if(err)throw err;
        console.log(result);
        
    });
}
// ls('alter table awaiting_payment modify column transaction_id varchar(45) not null unique')
// const array = ['username varchar(45) not null unique', 'amount_paid varchar(255) not null unique', 'amount_to_be_recieved varchar(255) not null unique',' amount_recieved varchar(255) unique'];
// array.forEach(item=>{
//     ls(`alter table awaiting_payment add column ${item}`)
// })
// ls(`truncate table awaiting_payment`)
// ls(`truncate table to_pay`)
// ls(`truncate table registered_users`)
// ls(`truncate table ongoing_registration`)
// ls(`truncate table activated_users `)
// ls(`delete from awaiting_payment where username = 'radiance_obi' `);
// uni = 'uni'
// ls(`update to_pay set amount = 10000 where username = 'Nkprincek'`);
// ls('select * from to_pay ');
module.exports = db ;