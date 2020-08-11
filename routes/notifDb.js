const mysql = require('mysql');
const db = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'netftgvf_admin',
    password: 'netflixnetworking',
    database: 'netftgvf_notification',
});
db.connect((err) => {
    if (err) throw err;
    console.log('notif online')
});


const command = (text) => {
    sql = text;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
    })
}
const clean = () => {
    const sql = `show tables`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length != 0) {

            result.forEach(table => {
                const tables = table.Tables_in_netftgvf_notification
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
// command('show tables')


module.exports = db 