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
// ls('truncate table sessions')
// ls('select * from sessions');
module.exports = db