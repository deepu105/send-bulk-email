## Send Bulk EMail

A handy NodeJS script to send bulk emails to contacts from a CSV list

### Usage

Steps to call this API (clone the repo, CD into it and run `npm install` first)

```
node sendEmail mailinglist.csv
```

Argument 1 is the CSV file name in the same directory. The CSV should have `name,email` as header followed by actual names, email ids, example below

```
name,email
Deepu,test.test@test.com
Joe,joe@test.com
```

The Email HTML Body content, Subject and Signature can be directly edited on the script file `sendEmail.js`

Add a `.env` file with following

```
EMAIL_USER="smtp server user, normally your email id"
EMAIL_PASS="your email password"
EMAIL_HOST=smtp.yourhost.com
EMAIL_FROM="the email id to be used as from"
```


Inspired by https://github.com/psudeep/send-bulk-email
