import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, text: string, from: string) {
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "uyzlzquge4n7qwfg@ethereal.email", // generated ethereal user
      pass: "JjxMTxzkpZNjDvSVBQ", // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `${from} <noreply@goloop.com>`, // sender address
    to, // list of receivers
    subject: "Report from user", // Subject line
    text, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
