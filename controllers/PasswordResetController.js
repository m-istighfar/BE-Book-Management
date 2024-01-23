const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Joi = require("joi");
const { sendPasswordResetEmail } = require("../services/mailService");

const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json(data ? { message, data } : { message });
};

const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({ error: message });
};

const validateEmail = (email) => {
  const schema = Joi.string().email().required();
  return schema.validate(email);
};

const validateResetPassword = (password, verificationCode) => {
  const passwordSchema = Joi.string().min(6).required();

  const verificationCodeSchema = Joi.string().required();

  const passwordValidation = passwordSchema.validate(password);
  if (passwordValidation.error) {
    return { error: passwordValidation.error };
  }

  const codeValidation = verificationCodeSchema.validate(verificationCode);
  if (codeValidation.error) {
    return { error: codeValidation.error };
  }

  return { error: null };
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const validationResult = validateEmail(email);
  if (validationResult.error) {
    return errorResponse(res, "Invalid email format");
  }

  const userAuth = await prisma.userAuth.findUnique({
    where: { Email: email },
  });

  if (!userAuth) {
    return errorResponse(res, "No account with that email address exists.");
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const resetPasswordExpires = new Date(Date.now() + 3600000);

  await prisma.userAuth.update({
    where: { UserAuthID: userAuth.UserAuthID },
    data: {
      VerificationCode: verificationCode,
      ResetPasswordExpires: resetPasswordExpires,
    },
  });

  const { success, error: mailError } = await sendPasswordResetEmail(
    email,
    verificationCode
  );

  if (!success) {
    return errorResponse(res, "Failed to send verification code.", 500);
  }

  return successResponse(res, "Password reset verification code sent.");
};

const resetPassword = async (req, res) => {
  const { verificationCode, newPassword, confirmPassword } = req.body;

  const userAuth = await prisma.userAuth.findFirst({
    where: {
      VerificationCode: verificationCode,
      ResetPasswordExpires: { gt: new Date() },
    },
  });

  if (!userAuth) {
    return errorResponse(res, "Verification code is invalid or has expired.");
  }

  const validationResult = validateResetPassword(newPassword, verificationCode);
  if (validationResult.error) {
    return errorResponse(res, validationResult.error.details[0].message);
  }

  if (newPassword !== confirmPassword) {
    return errorResponse(res, "Password confirmation does not match");
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.userAuth.update({
      where: { UserAuthID: userAuth.UserAuthID },
      data: {
        Password: hashedPassword,
        VerificationCode: null,
        ResetPasswordExpires: null,
      },
    });

    return successResponse(res, "Password successfully reset.");
  } catch (error) {
    return errorResponse(res, "Error resetting the password");
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};
