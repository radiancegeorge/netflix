const mysql = require('mysql');
const db = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'netftgvf_admin',
    password: 'netflixnetworking',
    database: 'netftgvf_user_transactions',
});
db.connect((err)=>{
    if(err)throw err;
    console.log('personalDb online')
});


const command = (text)=>{
    sql = text;
    db.query(sql, (err, result)=>{
        if(err)throw err;
        console.log(result);
    })
}
// command('drop table radianceobi')


module.exports = db 