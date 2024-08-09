const express = require('express');
const ejs = require('ejs');
const cors = require('cors');
const app = express();
require('dotenv').config();
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
  origin: true,
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



// app.get('/api/get',(req, res) => {


//   let sqlQuery = `SELECT * FROM logs_table`;

//   let query = conn.query(sqlQuery, (err, results) => {
    
//     res.send(results);
//   }); 
  
 
// });







app.post('/api/post', upload.single('file'), async (req, res) => {
  try {
    const { database, server, time, link } = req.body;

   let now = new Date();

// Get the current UTC time in milliseconds
let utcTime = now.getTime();

// Calculate the offset for IST (UTC+5:30)
let istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

// Adjust the current time by adding the offset for IST
let istTime = new Date(utcTime + istOffset);

// Extract hours, minutes, and AM/PM from the IST time
let hours = istTime.getHours();
let minutes = istTime.getMinutes();
let ampm = hours >= 12 ? 'PM' : 'AM';
hours = hours % 12;
hours = hours ? hours : 12; // Handle midnight (0 hours)

// Format the time string
let istTimeString = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;



    // Construct the backup command based on the database type

   

   

   const mailOptions = {
    from: 'webmaster@plaksha.edu.in',
    to: 'chandan.dubey@plaksha.edu.in',
    // to: 'saksham.somra@gmail.com',
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
                <td>${istTimeString}</td>
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






app.post('/api/emailpost', upload.single('file'), async (req, res) => {
  try {
    const { database, server, time, link, name, email, org, address, to, text } = req.body;

   let now = new Date();

// Get the current UTC time in milliseconds
let utcTime = now.getTime();

// Calculate the offset for IST (UTC+5:30)
let istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

// Adjust the current time by adding the offset for IST
let istTime = new Date(utcTime + istOffset);

// Extract hours, minutes, and AM/PM from the IST time
let hours = istTime.getHours();
let minutes = istTime.getMinutes();
let ampm = hours >= 12 ? 'PM' : 'AM';
hours = hours % 12;
hours = hours ? hours : 12; // Handle midnight (0 hours)

// Format the time string
let istTimeString = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;



    // Construct the backup command based on the database type

   const addressText = `${address ? address : ''}${text ? text : ''}`;

   let clickhere = "";

   if(to == "info.cleanenergy@plaksha.edu.in"){
    clickhere = "https://plaksha.edu.in/center-for-clean-energy";
   } else if(to == "career.development@plaksha.edu.in"){
    clickhere = "https://plaksha.edu.in/corporate-partnerships-careers";
   }

   

   const mailOptions = {
    from: 'webmaster@plaksha.edu.in',
    // to: 'career.development@plaksha.edu.in',
    to: to,
    cc: ['chandan.dubey@plaksha.edu.in'], // Add the CC recipients' email addresses here as an array
    subject: 'Message Received',
    html: `
        <head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <style type="text/css">
        @media screen {
            @font-face {
                font-family: 'Lato';
                font-style: normal;
                font-weight: 400;
                src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
            }
 
            @font-face {
                font-family: 'Lato';
                font-style: normal;
                font-weight: 700;
                src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
            }
 
            @font-face {
                font-family: 'Lato';
                font-style: italic;
                font-weight: 400;
                src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
            }
 
            @font-face {
                font-family: 'Lato';
                font-style: italic;
                font-weight: 700;
                src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
            }
        }
 
        /* CLIENT-SPECIFIC STYLES */
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
 
        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
 
        img {
            -ms-interpolation-mode: bicubic;
        }
 
        /* RESET STYLES */
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
 
        table {
            border-collapse: collapse !important;
        }
 
        body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }
 
        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
 
        /* MOBILE STYLES */
        @media screen and (max-width:600px) {
            h1 {
                font-size: 32px !important;
                line-height: 32px !important;
            }
        }
 
        /* ANDROID CENTER FIX */
        div[style*="margin: 16px 0;"] {
            margin: 0 !important;
        }
    </style>
</head>
 
<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
    <!-- HIDDEN PREHEADER TEXT -->
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"> We're thrilled to have you here! Get ready to dive into your new account.
    </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <!-- LOGO -->
        <tr>
            <td bgcolor="#00555a" align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#00555a" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                            <h1 style="font-size: 48px; font-weight: 400; margin: 2;"></h1> <img src="https://plaksha.edu.in/assets/logo-green.png?v=2" width="300" height="300" style="display: block; border: 0px;" />
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">New submission from link <a href=${clickhere}>Click here</a></p>
                        </td>
                    </tr>
                 <!-- COPY -->
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                          <table class="table table-bordered">
                            <thead>
                                <th class="w-50 mr-5">Name</th>
                                <th class="w-50 ">Email</th>
                                <th class="w-50 mr-5">Organisation</th>
                                <th class="w-50 ">Message</th>
                            </thead>
                            <tbody>
                                <td class=" mr-5" style="padding: 30px !important;">${name}</td>
                                <td class="p-5" style="padding: 30px !important;">${email}</td>
                                <td class=" mr-5" style="padding: 30px !important;">${org}</td>
                                <td class="p-5" style="padding: 30px !important;">${addressText}</td>
                            </tbody>
                          </table>
                        </td>
                    </tr> <!-- COPY -->
 
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#FFECD1" align="center" style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
 
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#f4f4f4" align="left" style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;"> <br>
                            <p style="margin: 0;"><a href="#" target="_blank" style="color: #111111; font-weight: 700;"></a>.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
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







app.post('/api/fail', upload.single('file'), async (req, res) => {
  try {
    const { database, server, time, link } = req.body;

    // Construct the backup command based on the database type
   let now = new Date();

// Get the current UTC time in milliseconds
let utcTime = now.getTime();

// Calculate the offset for IST (UTC+5:30)
let istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

// Adjust the current time by adding the offset for IST
let istTime = new Date(utcTime + istOffset);

// Extract hours, minutes, and AM/PM from the IST time
let hours = istTime.getHours();
let minutes = istTime.getMinutes();
let ampm = hours >= 12 ? 'PM' : 'AM';
hours = hours % 12;
hours = hours ? hours : 12; // Handle midnight (0 hours)

// Format the time string
let istTimeString = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

console.log('Current time in IST (with AM/PM):', istTimeString);


   

   const mailOptions = {
    from: 'webmaster@plaksha.edu.in',
    to: 'chandan.dubey@plaksha.edu.in',
    // to: 'saksham.somra@gmail.com',
    cc: ['saksham.somra@gmail.com', 'ayush.binjola@plaksha.edu.in'], // Add the CC recipients' email addresses here as an array
    subject: 'Message Received',
    html: `
        <table>
            <tr>
                <td colspan="2" style="text-align: center; font-weight: bold;">Backup Information</td>
            </tr>
            <tr>
                <td>Backup Failed for:</td>
                <td> ${database}</td>
            </tr>
            <tr>
                <td>Server:</td>
                <td>${server}</td>
            </tr>
            <tr>
                <td>Time:</td>
                <td>${istTimeString}</td>
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



app.get('/api/data', (req, res) => {
    const data = {
    "entity": "monthly-emi",
    "event": "emi.disbursed",
    "timestamp": "22-04-2024 18:59:36",
    "reference_id": "NDI300100",
    "application_details": {
        "code": "GQEMI-DUMMY12345",
        "ID": 1838269,
        "created_on": "19-04-2024 11:25:32"
    },
    "student_details": {
        "code": "90b3879b-c0f5-4d42-ac53-1a2578751b6c",
        "group": "Plaksha Inhouse",
        "institute": "Plaksha University",
        "location": "Mohali",
        "education_type": "NA",
        "class": "Class IX",
        "academic_year": "2023-2024",
        "first_name": "Divya",
        "middle_name": "Rajesh",
        "last_name": "Malhotra",
        "student_uuid": "SCS97141000",
        "type": "EXISTING"
    },
    "fee_details": {
        "amount": 95424,
        "plan_name": "Plaksha University - 10 EMIs (AY 2024-2025)",
        "tenure": 10,
        "interest_rate": 0,
        "processing_rate": 0,
        "discount_rate": 3,
        "fee_details_split": [
            {
                "code": "1ea6fa7d-e5d3-416a-9e89-26bcee008151",
                "fee_type_name": "payable_fee_0",
                "fee_type_code": "a2e01ce4-3ebd-42c8-99d2-727bb7369871",
                "amount": 95424,
                "concession": 0,
                "discount_rate": 3,
                "discount_amount": 2863
            },
            {
                "code": "a527b798-8ddd-43a6-acba-1ae2efbf4745",
                "fee_type_name": "payable_fee_1",
                "fee_type_code": "29bf7018-f1e6-4004-9a70-55a699a67c4e",
                "amount": 0,
                "concession": 0,
                "discount_rate": 3,
                "discount_amount": 0
            },
            {
                "code": "e996c4a2-9ebc-4526-bb90-d11a60691e2a",
                "fee_type_name": "payable_fee_2",
                "fee_type_code": "84d9b89c-9952-497b-adb0-c0fa8f991074",
                "amount": 0,
                "concession": 0,
                "discount_rate": 3,
                "discount_amount": 0
            },
            {
                "code": "9191de74-ecfb-4daa-984d-d0ff06df2a5e",
                "fee_type_name": "payable_fee_3",
                "fee_type_code": "997475d4-f3ca-4df2-8aab-57ad3709a60a",
                "amount": 0,
                "concession": 0,
                "discount_rate": 3,
                "discount_amount": 0
            },
            {
                "code": "e9fe3e53-2d54-48ad-b880-916abfe391b9",
                "fee_type_name": "payable_fee_4",
                "fee_type_code": "918d37bd-55b6-445b-a381-91f4b586ac32",
                "amount": 0,
                "concession": 0,
                "discount_rate": 3,
                "discount_amount": 0
            },
            {
                "code": "2559f4e7-d68e-4df0-b208-127d0f0e8ce7",
                "fee_type_name": "payable_fee_5",
                "fee_type_code": "2e6a930b-95c4-464f-aa63-fdbaf3fbffd0",
                "amount": 0,
                "concession": 0,
                "discount_rate": 3,
                "discount_amount": 0
            }
        ],
        "discount_amount": 2863,
        "retention_amount": 27769,
        "disbursed_amount": 64793
    },
    "customer_details": {
        "code": "6df641e7-25a9-4715-87fa-6cf0e244ad48",
        "first_name": "Rajesh",
        "middle_name": "Ashokrao",
        "last_name": "Malhotra",
        "mobile": "6302520629",
        "email": "Malhotra@gmail.com",
        "pan": "AHKPN7715J",
        "dob": "1981-08-15",
        "gender": "FEMALE"
    },
    "merchant_details": {
        "merchant_id": "GQ-ef4688e5-0830-4f52-aa92-67bae23c2785"
    },
    "unique_master_bank_details": {
        "account_number": "911010059946739",
        "ifsc": "UTIB0001017",
        "account_holder_name": "Mr Rajesh Malhotra",
        "bank_name": "Development Bank of India",
        "branch_name": "Juhu Branch",
        "account_type": "SAVINGS"
    },
    "disbursement_details": {
        "amount": 95424,
        "date": "20-04-2024",
        "utr": "AXISP00492717262",
        "disbursed_amount": 64793,
        "discount_rate": 3,
        "discount_amount": 2863,
        "retention_rate": 30,
        "retention_amount": 27769,
        "discount_gst_rate": 0,
        "discount_gst_amount": 0,
        "split_disbursement_details": []
    },
    "downpayment_details": {
        "label": "EMI 1",
        "due_date": "19-4-2024",
        "amount": 9543,
        "balance_amount": 0,
        "paid_amount": 9543,
        "is_complete": true,
        "overdue_days": 0,
        "overdue_amount": 0
    },
    "udf_details": {
        "udf_1": null,
        "udf_2": null,
        "udf_3": null,
        "udf_4": null,
        "udf_5": null,
        "udf_6": null,
        "udf_7": null,
        "udf_8": null,
        "udf_9": null,
        "udf_10": null
    },
    "notes": {
        "program": "B.Tech",
        "Course": "Computer Science",
        "year/semester": "2023-2024",
        "platform": "Online",
        "class": "Class IX",
        "location": "Mohali",
        "total_due": 30,
        "total_net_due": "0"
    }
};

    res.json(data); // Send JSON response
});


// const mailOptions = {
//   from: 'webmaster@plaksha.edu.in',
//    to: 'chandan.dubey@plaksha.edu.in',
//  // to: 'saksham.somra@gmail.com',
//   subject: 'Message Received',
//   text: `${databaseName} ,backup done`,
// };
// transporter.sendMail(mailOptions);






app.post('/api/emailpostctlc', upload.single('file'), async (req, res) => {
  try {
    const { database, server,message, phone, time, link, name, email, org, address, to, text } = req.body;

   let now = new Date();

// Get the current UTC time in milliseconds
let utcTime = now.getTime();

// Calculate the offset for IST (UTC+5:30)
let istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

// Adjust the current time by adding the offset for IST
let istTime = new Date(utcTime + istOffset);

// Extract hours, minutes, and AM/PM from the IST time
let hours = istTime.getHours();
let minutes = istTime.getMinutes();
let ampm = hours >= 12 ? 'PM' : 'AM';
hours = hours % 12;
hours = hours ? hours : 12; // Handle midnight (0 hours)

// Format the time string
let istTimeString = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;



    // Construct the backup command based on the database type

   const addressText = `${address ? address : ''}${text ? text : ''}`;

   let clickhere = "";

   if(to == "info.cleanenergy@plaksha.edu.in"){
    clickhere = "https://plaksha.edu.in/ctlc";
   } else if(to == "career.development@plaksha.edu.in"){
    clickhere = "https://plaksha.edu.in/ctlc";
   } else{
     clickhere = "https://plaksha.edu.in/ctlc";
   }

   

   const mailOptions = {
    from: 'webmaster@plaksha.edu.in',
    // to: 'career.development@plaksha.edu.in',
    to: to,
    cc: ['chandan.dubey@plaksha.edu.in'], // Add the CC recipients' email addresses here as an array
    subject: 'Message Received',
    html: `
        <head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <style type="text/css">
        @media screen {
            @font-face {
                font-family: 'Lato';
                font-style: normal;
                font-weight: 400;
                src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
            }
 
            @font-face {
                font-family: 'Lato';
                font-style: normal;
                font-weight: 700;
                src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
            }
 
            @font-face {
                font-family: 'Lato';
                font-style: italic;
                font-weight: 400;
                src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
            }
 
            @font-face {
                font-family: 'Lato';
                font-style: italic;
                font-weight: 700;
                src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
            }
        }
 
        /* CLIENT-SPECIFIC STYLES */
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
 
        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
 
        img {
            -ms-interpolation-mode: bicubic;
        }
 
        /* RESET STYLES */
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
 
        table {
            border-collapse: collapse !important;
        }
 
        body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }
 
        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
 
        /* MOBILE STYLES */
        @media screen and (max-width:600px) {
            h1 {
                font-size: 32px !important;
                line-height: 32px !important;
            }
        }
 
        /* ANDROID CENTER FIX */
        div[style*="margin: 16px 0;"] {
            margin: 0 !important;
        }
    </style>
</head>
 
<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
    <!-- HIDDEN PREHEADER TEXT -->
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"> We're thrilled to have you here! Get ready to dive into your new account.
    </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <!-- LOGO -->
        <tr>
            <td bgcolor="#00555a" align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#00555a" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                            <h1 style="font-size: 48px; font-weight: 400; margin: 2;"></h1> <img src="https://plaksha.edu.in/assets/logo-green.png?v=2" width="350" height="300" style="display: block; border: 0px;" />
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 100%;">
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">New submission from link <a href="http://15.206.1.232/dev/ctlc">Click here</a></p>
                        </td>
                    </tr>
                 <!-- COPY -->
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                          <table class="table table-bordered">
                            <thead>
                                <th class="w-50 mr-5">Name</th>
                                <th class="w-50 ">Email</th>
                                <th class="w-50 mr-5">Phone</th>
                                <th class="w-50 ">Tell Us About Your Idea</th>
                            </thead>
                            <tbody>
                                <td class=" mr-5" style="padding: 30px !important;">${name}</td>
                                <td class="p-5" style="padding: 30px !important;">${email}</td>
                                <td class=" mr-5" style="padding: 30px !important;">${phone}</td>
                                <td class="p-5" style="padding: 30px !important;">${message}</td>
                            </tbody>
                          </table>
                        </td>
                    </tr> <!-- COPY -->
 
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#FFECD1" align="center" style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
 
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#f4f4f4" align="left" style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;"> <br>
                            <p style="margin: 0;"><a href="#" target="_blank" style="color: #111111; font-weight: 700;"></a>.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
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



 
 
function apires(results) {
  return JSON.stringify({ "status": 200, "error": null, "res": results });
}
/*------------------------------------------
--------------------------------------------
Server listening
--------------------------------------------
--------------------------------------------*/
 
app.listen(3001);
