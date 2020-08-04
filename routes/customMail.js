const nodemailer = require('nodemailer');
// const e = require('express');
const uuid = require('uuid');

let transporter = nodemailer.createTransport({
    host: "netflixnetworking.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'notify@netflixnetworking.com', // generated ethereal user
        pass: 'netflixnetworking', // generated ethereal password
    },

});
const sendMail = (mail, text)=>{
    transporter.sendMail({
        from: '"Netflix Networking" <notify@netflixnetworking.com>', // sender address
        to: mail, // list of receivers
        subject: 'Merge', // Subject line
        text: text, // plain text body
        html:'', // html body
    }, (err, info) => {
        if (err) throw err;
        console.log(info)
        console.log("Message sent: %s", info.messageId);
        // res.render('checkmail');
        // req.app.locals.email = data.email;

    });
}
module.exports = sendMail;
