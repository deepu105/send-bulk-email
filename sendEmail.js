/*
Steps to call this API
`node sendEmail mailinglist.csv`
Argument 1 is the file name in the same directory as code with name and email IDs to people whom mailer has to be  sent.
*/

const nodemailer = require("nodemailer");
const csv = require("csvtojson");

require("dotenv").config();

const params = process.argv;
const csvFile = params[2];
const fromEmail = process.env.EMAIL_FROM;
const currentPath = process.cwd();

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
  authMethod: "PLAIN",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// verify connection configuration
smtpTransport.verify((error) => {
  if (error) {
    console.log(error);
    process.exit(0);
  } else {
    console.log("SMTP Server is ready to send messages");
  }
});

const sendEmail = (toEmailId, html, subject, close) =>
  new Promise((resolve, reject) => {
    const msg = {
      from: fromEmail, // sender address
      to: toEmailId,
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
      return resolve("Sending success");
    });
  });

const csvFilePath = currentPath + "/" + csvFile;

console.log("csvFilePath", csvFilePath);

csv()
  .fromFile(csvFilePath)
  .then((jsonObj) => {
    jsonObj.map((i) => {
      const SUBJECT = `Hi ${i.name} - Wish you Happy Diwali`;
      const emailId = i.email;
      console.log("emailId", emailId, "subject", SUBJECT);
      const HTML_BODY = `
        Hi ${i.name},<br/><br/>
        Wishing you a happy and blessed Diwali!<br/>
        May the lamps of joy, illuminate your life and fill your days with the bright sparkles of peace, mirth and goodwill. <br/>May the light of joy and prosperity shine on you this diwali. <br/>
        And throughout comming year. "HAPPY DIWALI" To you & your family<br/><br/>
        best regards,<br/>
        Medimojo Team.
      `;
      sendEmail(emailId, HTML_BODY, SUBJECT)
        .then(() => {
          console.log("success:sent:::==", i.name);
        })
        .catch((e) => {
          console.log("error", e);
        });
    });
  });
