const express = require('express');
const ejs = require('ejs');
const cors = require('cors');
const app = express();
const session = require('express-session')
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const { Client } = require('@microsoft/microsoft-graph-client');
const { exec } = require('child_process');
const { query } = require('express');
const saltRounds = 10;
const path = require('path')
const multer = require("multer");
const cookieParser = require('cookie-parser');
const MySQLStore = require('express-mysql-session')(session);
const fs = require('fs');
const nodemailer = require('nodemailer');
// app.use('/Images', express.static('Images'));
const cron = require('node-cron');
const CronJob = require('cron').CronJob;
const transporter = require('./nodemailerconfig');
const emailQueue = [];
const axios = require('axios');
const emailValidator = require('email-validator');
const { Dropbox } = require('dropbox');
const isValidEmail = emailValidator.validate('example@email.com');

 

 
app.use(bodyParser.json());
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true
}));
 
 
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
 
 

const processEmailQueue = async () => {
  while (emailQueue.length > 0) {
    const emailRequest = emailQueue.shift();
    try {
      await transporter.sendMail(emailRequest.mailOptions);
    } catch (error) {
      console.error(`Error sending email to ${emailRequest.mailOptions.to}: ${error.message}`);
    }
  }
};

 


 
 
 
 

 

 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const projectId = req.body.projectId || 'defaultProjectId';
    const uploadPath = path.join('uploads', projectId);
    console.log(projectId);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
 
}
);
const upload = multer({ storage: storage });
 
 
 
 
 
app.get('/health', (req, res) => {
 
    res.send("ok");
 
});
 
app.post('/api/post', upload.single('file'), async (req, res) => {
  try {
    const { database, server, time, link } = req.body;

    // Construct the backup command based on the database type

   

   const mailOptions = {
    from: 'webmaster@plaksha.edu.in',
    to: 'chandan.dubey@plaksha.edu.in',
    cc: ['saksham.somra@gmail.com', 'ayush.binjola@plaksha.edu.in'], // Add the CC recipients' email addresses here as an array
    subject: 'Message Received',
    html: `
        <table>
            <tr>
                <td colspan="2" style="text-align: center; font-weight: bold;">Backup Information</td>
            </tr>
            <tr>
                <td>Backup for:</td>
                <td>${database}</td>
            </tr>
            <tr>
                <td>Server:</td>
                <td>${server}</td>
            </tr>
            <tr>
                <td>Time:</td>
                <td>${time}</td>
            </tr>
            <tr>
                <td>Dropbox Link:</td>
                <td><a href="${link}">${link}</a></td>
            </tr>
        </table>
    `
};

    await transporter.sendMail(mailOptions);

    res.send("Sent");
  } catch (error) {
    // Handle any errors that might occur during sending the email
    console.error("Error occurred while sending email:", error);
    res.status(500).send("Error occurred while sending email");
  }
});

// const mailOptions = {
//   from: 'webmaster@plaksha.edu.in',
//    to: 'chandan.dubey@plaksha.edu.in',
//  // to: 'saksham.somra@gmail.com',
//   subject: 'Message Received',
//   text: `${databaseName} ,backup done`,
// };
// transporter.sendMail(mailOptions);
 
 
function apires(results) {
  return JSON.stringify({ "status": 200, "error": null, "res": results });
}
/*------------------------------------------
--------------------------------------------
Server listening
--------------------------------------------
--------------------------------------------*/
 
app.listen(3001);
