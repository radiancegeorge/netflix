const express = require('express');
const fileUpload = express.Router();
const db = require('../db');
const personalDb = require('../personalDb');
const uniqid = require('uniqid');
const awaiting = require('../awaitingDb');
const customMail = require('../customMail');
const upload = require('express-fileupload');
const notifDb = require('../notifDb')

fileUpload.use(express.urlencoded({extended: false}))
fileUpload.use(upload({
    limits: {fileSize: 1024 * 1024 * 2},
}));

fileUpload.post('/fileupload', (req, res)=>{
    const user = req.app.locals.user;
    const reciever = req.body.reciever
    if(req.files){
        const image = req.files.image;
        const minumumSize = 1024 * 1024 * 2;
        if(image.size <= minumumSize){
            // console.log(image.mimetype)
            if(image.mimetype === 'image/png' || image.mimetype === 'image/jpeg'){
                const name = image.name;
                const data = image.data;
                image.mv(`${__dirname}/../../public/src/img/uploaded/${name}`, (err)=>{
                    if(err)throw err;
                    const sql = `select * from ${reciever}`;
                    notifDb.query(sql, (err, result)=>{
                        if(err)throw err;
                        const previousCount = result.length;
                        const sql = `insert into ${reciever} (username, file_name, previous_count) values (?,?,?)`
                        notifDb.query(sql, [user, name, previousCount ], (err, result)=>{
                            if(err)throw err;
                            console.log('uploaded');
                            req.app.locals.msg = 'Your image has been uploaded and sent, please wait for confirmation';
                            console.log('uploaded');
                            res.redirect('/user/home');
                        } )
                        

                    })
                })
            }
        }else{
            req.app.locals.msg = 'file too large, please make sure it is less than 2mb';
            res.redirect('/user/home')
        }
    }
})


module.exports = fileUpload