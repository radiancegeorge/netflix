const nodemailer = require('nodemailer');
// const e = require('express');
const uuid = require('uuid');

let transporter = nodemailer.createTransport({
    host: "netflixnetworking.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'verify@netflixnetworking.com', // generated ethereal user
        pass: 'netflixnetworking', // generated ethereal password
    },
    
});

// send mail with defined transport object

module.exports = transporter;
// const something = new Promise((resolve, reject)=>{

//   const hello = 'greetings'
//     resolve(hello);
//     reject('something')
// });
// something.then(ans =>{
//     console.log(ans)
// })

// messagebird**** might be needed