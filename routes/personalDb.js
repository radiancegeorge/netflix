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
const clean = () => {
    const sql = `show tables`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length != 0) {

            result.forEach(table => {
                const tables = table.Tables_in_netftgvf_user_transactions
                // console.log(tables);
                db.query(`drop table ${tables}`, (err, result) => {
                    if (err) throw err;
                    console.log(result);
                })
            })

        }
    })
}
const createTime = () => {
    const sql = `show tables`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length != 0) {

            result.forEach(table => {
                const tables = table.Tables_in_netftgvf_user_transactions
                // console.log(tables);
                const sql = `alter table ${tables} add time varchar(255)`
                db.query(sql, (err, result) => {
                    if (err) throw err;
                    console.log(result);
                })
            })

        }
    })
};



// command('alter table Nkprincek add column time varchar(255)')
// command('truncate table radiance_obi')
// command('show tables')
// command('update Uchenna set amount_recieved = 38000 where transaction_id = "kdqcaxf5"')


module.exports = db 