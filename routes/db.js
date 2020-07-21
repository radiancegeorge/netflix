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
        if(err)throw err;
        console.log(result)
    })
}
// ls('truncate table ongoing_registration')
// ls('truncate table registered_users')
ls('select * from ongoing_registration')
module.exports = db