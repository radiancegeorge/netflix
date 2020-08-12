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

const clean = () => {
    const sql = `show tables`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length != 0) {

            result.forEach(table => {
                const tables = table.Tables_in_netftgvf_referrals
                // console.log(tables);
                db.query(`drop table ${tables}`, (err, result) => {
                    if (err) throw err;
                    console.log(result);
                })
            })

        }
    })
}
// clean()
// ls(`drop table ifeoma`)
// ls(`drop table Preshnwoko`)
// ls(`drop table Ifeoma`)
// ls(`select * from Uchenna `)
// ls(`update radianceobi set amount = 5000 where username = 'radiance_obi' `) 
module.exports = db;