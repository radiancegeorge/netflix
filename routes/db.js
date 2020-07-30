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
const ls = (sql)=>{
    q = sql;
    db.query(q, (err, result)=>{
        // if(err)throw err;
        if(err){
            console.log(err.code)
            if (err.code === 'ER_BAD_FIELD_ERROR'){
                console.log('no user')
            }else{
                throw err;
            }
        }
        console.log(result)
    });
}
// ls('alter table awaiting_payment modify column transaction_id varchar(45) not null unique')
// const array = ['username varchar(45) not null unique', 'amount_paid varchar(255) not null unique', 'amount_to_be_recieved varchar(255) not null unique',' amount_recieved varchar(255) unique'];
// array.forEach(item=>{
//     ls(`alter table awaiting_payment add column ${item}`)
// })
// ls(`delete from awaiting_payment where username = 'radiance_obi'`)
// ls(`select * from awaiting_payment`)
module.exports = db