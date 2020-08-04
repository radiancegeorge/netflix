const mysql = require('mysql');

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'netftgvf_admin',
    password: 'netflixnetworking',
    database: 'netftgvf_awaiting_payment',
});

db.connect(() => {
    console.log('connected to awaiting database')
});



const command = (text) => {
    sql = text;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
    })
}


// command('drop table radianceobi')
// command('create table test (id varchar(45) primary key, username varchar(45) unique, amount varchar(255), date varchar(255), status varchar(45))')
module.exports = db
