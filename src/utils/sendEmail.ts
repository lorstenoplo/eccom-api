import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, text: string, from: string) {
  const email: string = process.env.REPORT_TARGET_EMAIL!;
  const password: string = process.env.REPORT_TARGET_PASSWORD!;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: email,
      pass: password,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `${from} <noreply@goloop.com>`, // sender address
    to, // list of receivers
    subject: `Report from ${from}`, // Subject line
    text, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
