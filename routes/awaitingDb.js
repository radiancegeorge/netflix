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


// command('drop table Preshnwoko')
// command('drop table radiance_obi')
// command('select date from radianceobi')
module.exports = db
 