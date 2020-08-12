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
const clean = ()=>{
    const sql = `show tables`;
    db.query(sql, (err, result)=>{
        if(err)throw err;
        if(result.length != 0){
           
            result.forEach( table =>{
                const tables = table.Tables_in_netftgvf_awaiting_payment
                // console.log(tables);
                db.query(`drop table ${tables}`, (err, result)=>{
                    if(err) throw err;
                    console.log(result);
                })
            })
            
        }
    })
}
// clean()
// command('create table tests (username varchar(45), date varchar(255))')
// command('delete from Promise where username = "Nkprincek"')
// command('select * from Uchenna');



module.exports = db
 