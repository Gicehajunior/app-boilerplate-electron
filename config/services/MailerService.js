"use strict";
const Nodemailer = require("nodemailer");  
require('dotenv').config();

class Mailer {
    constructor(
        mail_host = undefined, 
        mail_port = undefined, 
        mail_source_address = undefined, 
        mail_encryption_criteria = undefined, 
        email_username = undefined, 
        email_password = undefined
    ) {
        this.mail_host = (process.env.MAIL_HOST) ? process.env.MAIL_HOST : mail_host;
        this.mail_port = (process.env.MAIL_PORT) ? process.env.MAIL_PORT : mail_port;
        this.mail_source_address = (process.env.MAIL_SOURCE_ADDRESS) ? process.env.MAIL_SOURCE_ADDRESS : mail_source_address;
        this.mail_encryption_criteria = (process.env.MAIL_ENCRYPTION_CRITERIA) ? process.env.MAIL_ENCRYPTION_CRITERIA : mail_encryption_criteria;
        this.email_username = (process.env.MAIL_SOURCE_USERNAME) ? process.env.MAIL_SOURCE_USERNAME : email_username;
        this.email_password = (process.env.MAIL_SOURCE_ADDRESS_PASSWORD) ? process.env.MAIL_SOURCE_ADDRESS_PASSWORD : email_password;
    }

    async send(recipients=[], subject, html_message_formart, text_message_formart = undefined) {  
        // create reusable transporter object using the default SMTP transport
        let response = undefined;

        try {
            let transporter = Nodemailer.createTransport({
                host: this.mail_host,
                port: this.mail_port,
                secure: (this.mail_port == 465) ? true : false, // true for 465, false for other ports
                auth: {
                    user: this.mail_source_address,  
                    pass: this.email_password,  
                },
            });
     
            const response_promise = await transporter.sendMail({
                from: `${this.email_username} <${this.mail_source_address}>`, // sender address
                to: [recipients], // list of receivers
                subject: subject, // Subject line
                text: text_message_formart, // plain text body
                html: html_message_formart, // html body
                attachments: undefined
            }); 

            response = response_promise;  
        } catch (error) {
            response = false;
        } 

        return response;
    }
}

module.exports = Mailer;



