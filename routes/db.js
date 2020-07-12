const mysql = require('mysql');

const db = mysql.createConnection({
    user: 'root',
    password: '',
    database: 'netflix',
    host: 'localhost',
    port: 9000
});

db.connect(()=>{
    console.log('connected to database on port ' + 9000)
});
module.exports = db