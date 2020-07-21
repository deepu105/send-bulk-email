/*
Steps to call this API
`node sendEmail mailinglist.csv`
Argument 1 is the CSV file name in the same directory. The CSV should have `name,email` as header followed by actual names, email ids
*/

const nodemailer = require("nodemailer");
const csv = require("csvtojson");

/* Load .env containing below
EMAIL_USER="smtp server user, normally your email id"
EMAIL_PASS="your email password"
EMAIL_HOST=smtp.yourhost.com
EMAIL_FROM="the email id to be used as from"
*/
require("dotenv").config();

const params = process.argv;
const csvFile = params[2];
const fromEmail = process.env.EMAIL_FROM;
const currentPath = process.cwd();

const timeoutMs = 1000; // Timeout used for spreading out load

if (csvFile) {
  console.log("CSV File", csvFile);
} else {
  console.log("CSV File not specified");
  process.exit(0);
}

// SMTP server configuration
var smtpTransport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  authMethod: "PLAIN", // change this if needed
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = (toEmailId, html, subject, close) =>
  new Promise((resolve, reject) => {
    const msg = {
      from: fromEmail, // sender address
      to: toEmailId, // to address,
      subject, // Subject line
      html, // html body
    };

    smtpTransport.sendMail(msg, (err) => {
      if (err) {
        console.error("Sending to " + toEmailId + " failed: " + err);
        return reject(err);
      }
      if (close) {
        msg.transport.close();
      }
      setTimeout(resolve, timeoutMs); // a small timeout so that your SMTP server doesn't block you
    });
  });

const csvFilePath = currentPath + "/" + csvFile;

console.log("csvFilePath", csvFilePath);

function sendBulkEmail() {
  csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      jsonObj.map(async (i) => {
        const signature = `
          Deepu K Sasidharan<br>
          <i>Developer Advocate</i><br><br>
          <i>Twitter: @deepu105</i><br>
          <a href="https://www.adyen.com/" display: inline-block;"><img src="https://i.imgur.com/KB3fWTZ.png" width="125" height="42" style="width: 125px; height: 42px; border: none;"></a>
          `;
        const senderName = "Deepu K Sasidharan";
        const subject = `Hi ${i.name} - You are invited to our online session`;
        const emailId = i.email;
        const htmlBody = `
            Hi ${i.name},<br/><br/>
    
            Hope you’re doing well. My name is ${senderName} and I am a developer advocate at <a href="https://www.adyen.com/">Adyen</a>.<br/><br/>
    
            Best,<br/>
    
            ${signature}
          `;
        console.log("Sending to emailId:", emailId, ", subject:", subject);
        try {
          await sendEmail(emailId, htmlBody, subject);
          console.log("success:sent:::==", i.name);
        } catch (e) {
          console.log("error", e);
        }
      });
    });
}

// verify connection configuration
smtpTransport.verify((error) => {
  if (error) {
    console.log(error);
    process.exit(0);
  } else {
    console.log("SMTP Server is ready to send messages");
    sendBulkEmail();
  }
});
