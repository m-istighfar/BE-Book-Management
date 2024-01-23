const nodemailer = require("nodemailer");
const smtp = require("nodemailer-smtp-transport");

const FE_URL = process.env.FE_URL;

const transporter = nodemailer.createTransport(
  smtp({
    service: "gmail",
    auth: {
      user: "daiqijb105@gmail.com",
      pass: "vezv gnsv qvne poca",
    },
  })
);

const sendMail = async (options) => {
  try {
    await transporter.sendMail(options);
    return { success: true };
  } catch (error) {
    console.error("Mail send error:", error);
    return { success: false, error };
  }
};

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${FE_URL}/verify-email/${token}`;

  const mailOptions = {
    from: "daiqijb105@gmail.com",
    to: email,
    subject: "Email Verification",
    text: `Click on the link to verify your email: ${verificationLink}`,
  };

  return await sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, verificationCode) => {
  const resetPageURL = `${FE_URL}/reset-password`;
  const mailOptions = {
    from: "daiqijb105@gmail.com",
    to: email,
    subject: "Password Reset Request",
    text:
      `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n` +
      `Please use the following verification code to complete the process: \n\n` +
      `Verification Code: ${verificationCode}\n\n` +
      `Enter this code on the following page: ${resetPageURL}\n\n` +
      `This code will expire in one hour.\n\n` +
      `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  return await sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
