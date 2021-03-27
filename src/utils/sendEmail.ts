import sgMail from "@sendgrid/mail";

// async..await is not allowed in global scope, must use a wrapper
export async function sendWelcomeEmail(to: string) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const msg = {
    to, // Change to your recipient
    from: "nishanthdipali@gmail.com", // Change to your verified sender
    templateId: process.env.SENDGRID_TEMPLATE_ID!,
    dynamic_template_data: {
      subject: "Welcome to the shop",
    },
  };
  try {
    await sgMail.send(msg);
    console.log("Email sent");
  } catch (error) {
    console.error(error);
  }
}

export async function sendByeEmail(to: string, username: string) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const msg = {
    to, // Change to your recipient
    from: "nishanthdipali@gmail.com", // Change to your verified sender
    templateId: process.env.SENDGRID_BYE_TEMPLATE_ID!,
    dynamic_template_data: {
      username,
    },
  };
  try {
    await sgMail.send(msg);
    console.log("Email sent");
  } catch (error) {
    console.error(error);
  }
}

export async function sendEmail(to: string, text: string, from: string) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const msg = {
    to, // Change to your recipient
    from: to, // Change to your verified sender
    subject: `Report from ${from}`,
    text,
  };
  try {
    await sgMail.send(msg);
    console.log("Email sent");
  } catch (error) {
    console.error(error);
  }
}
