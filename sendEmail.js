/*
Steps to call this API
`node sendEmail mailinglist.csv`
Argument 1 is the CSV file name in the same directory. The CSV should have `name,email` as header followed by actual names, email ids

Inspired by https://github.com/psudeep/send-bulk-email
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

const timeoutMs = 5000; // Timeout used for spreading out load

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

const getMsgParams = (name) => {
  const signature = `
    Deepu K Sasidharan<br>
    <i>Developer Advocate</i><br><br>
    <i>Mobile: +31 657 635 007</i><br>
    <i>Twitter: @deepu105</i><br>
    <a href="https://www.adyen.com/" style="color: rgb(27, 106, 203); display: inline-block;"><img src="https://i.imgur.com/KB3fWTZ.png" width="125" height="42" style="width: 125px; height: 42px; border: none;"></a>
    `;
  const senderName = "Deepu K Sasidharan";
  const subject = `Hi ${name} - You are invited to our online session`;
  const htmlBody = `
      Hi ${name},<br/><br/>

      Hope you’re doing well. My name is ${senderName} and I am a developer advocate at <a href="https://www.adyen.com/">Adyen</a>. I wanted to invite you to a live stream session. Normally, we host meetups, but given the uncertain times, we’re moving this edition online.<br/><br/>

      The session begins on <strong>Wednesday, November 25th, at 17:00 CET</strong>. We’ll be building a Java 11 web application using Spring Boot and integrating the Adyen Drop-in component to enable online checkouts. We will cover Adyen Java Library integration, Adyen web component integration, and so on. We will also answer any questions that you have.<br/><br/>

      We’d love for you to join and share your thoughts and suggestions. We’ll be streaming live in about two weeks, so let me know if you will be attending or reserve your virtual seat directly on the <a href="https://www.adyen.com/landing/education-sub-pages/global/developer-tutorials">session signup page</a> so that you can receive updates and reminders. Feel free to let me know if you have any questions or if you don’t want to receive any such emails from me in the future.<br/><br/>
      
      Hope to see you there!<br/><br/><br/>
      
      Best,<br/>

      ${signature}
    `;

  return [subject, htmlBody];
};

function sendBulkEmail() {
  csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      jsonObj.map(async (it) => {
        const { name, email } = it;
        const [subject, htmlBody] = getMsgParams(name);

        console.log(`Sending to emailId: ${email} subject: ${subject}`);
        try {
          await sendEmail(email, htmlBody, subject);
          console.log("success:sent:::==", name);
        } catch (e) {
          console.error(`Sending to "${name},${email}" failed: ${e}`);
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
