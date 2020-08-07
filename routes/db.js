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
// ls(`delete from ongoing_registration where username = 'radianceobi'`)
// ls(`drop table change_password`);
// uni = 'uni'
// ls(`create table change_password (id varchar(45) unique primary key, email varchar(150) unique not null)`)
module.exports = db 