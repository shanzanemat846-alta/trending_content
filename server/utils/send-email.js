const nodemailer = require('nodemailer')


const {
  HOST,
  EMAIL_FROM,
  EMAIL_AUTH_USER,
  EMAIL_AUTH_PASS
} = process.env;

const SendEmail = async (
  email,
  subject,
  bodyPart
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: HOST,
      port: 587,
      secureConnection: false,
      auth: {
        user: EMAIL_AUTH_USER,
        pass: EMAIL_AUTH_PASS
      }
    });

    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject,
      html: bodyPart
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = SendEmail;
