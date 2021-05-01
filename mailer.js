const nodemailer = require("nodemailer");

// sendEmail takes in a mailObj that contains the following fields:
//  1. mailList  (an Array of emails)
//  2. Title (A string which contains the title of the email)
//  3. Body (A string which contains what should be included in the body of the email)

async function sendEmail(mailObj) {
  try {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD,
          },
          tls: {
              rejectUnauthorized: false
          }
      });
      
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: process.env.EMAIL, // sender address
        to: mailObj.email, // list of receivers
        subject: "Verify bonanza account", // Subject line
        text: `${process.env.BASE_ENDPOINT_BACKEND}/verifyEmail/${mailObj.id}`, // plain text body
      });
      
      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch(e){
      throw e;
  }
}

module.exports = {sendEmail};