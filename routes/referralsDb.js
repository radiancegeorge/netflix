//netftgvf_referrals;
const mysql = require('mysql');

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'netftgvf_admin',
    password: 'netflixnetworking',
    database: 'netftgvf_referrals',
});

db.connect(() => {
    console.log('connected to referrals database')
});
const ls = (sql, data) => {
    q = sql;
    db.query(q, data, (err, result) => {
        // if(err)throw err;
        if (err) throw err;
        console.log(result);

    });
};
// ls(`drop table radiance_obi`)
// ls(`drop table radianceobi`)
// ls(`update radianceobi set amount = 5000 where username = 'radiance_obi' `) 
module.exports = db;