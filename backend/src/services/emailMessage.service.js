import nodemailer from 'nodemailer';
import config  from '../config.js'
import handlebars from 'handlebars';
import fs from 'fs';
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let configData = {
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || '',
        pass: process.env.GMAIL_PASS || ''
    }
    // pool: true,
    // host: 'smtpout.secureserver.net',
    // port: 465,
    // secure: true, 
    // auth: {
    //     user: "appshorex@gmail.com",
    //     pass: "amira20140077"
    // },
    // tls: {
    //     rejectUnauthorized: false,
    //     ciphers:'SSLv3'
    // }
    /////////////////////////////////////////////
    // tls: {
    //     rejectUnauthorized: false
    // },

    // host: 'smtp.office365.com',
    // port: 587,
    // secure: false, // true for 465, false for other ports
    // auth: {
    //   user: 'ajam@ajaminfo.com', // your domain email address
    //   pass: 'Ajam20201.ajam' // your password
    // }


}

let transporter = nodemailer.createTransport(configData);

export function sendHtmlEmail(targetMail, templateName, params, language) {
    try {
        params.domain = config.backend_endpoint;
        console.log('host name ', params.domain);

        let templatePath = `${__dirname}/../emails/${language || 'en'}/${templateName}`;
        let html = fs.readFileSync(templatePath, { encoding: 'utf8' });

        let template = handlebars.compile(html);
        template = template({ ...params });

        let mailOptions = {
            from: configData.auth.user,
            to: targetMail,
            subject: `${config.App.Name}`,
            html: template
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) console.log(error);
        });

        return true;
    } catch (error) {
        throw error;
    }
}

export function sendEmail(targetMail, text) {

    let mailOptions = {
        from: configData.auth.user,
        to: targetMail,
        subject: `${config.App.Name}`,
        text: text
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) console.log(error);
    });

    return true;
}