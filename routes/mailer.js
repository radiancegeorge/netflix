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
const sendMail = async (to, subject, text, html)=>{
    transporter.sendMail({
        from: '"Netflix Networking" <verify@netflixnetworking.com>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html:html === undefined? '' : html , // html body
    }, (err, info) => {
        if (err) throw err;
        console.log(info)
        console.log("Message sent: %s", info.messageId);
    })
}
module.exports = sendMail;


// messagebird**** might be needed