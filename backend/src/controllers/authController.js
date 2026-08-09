const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { sendVerificationOtp, sendResetPasswordEmail } = require("../utils/mailer");

const OTP_TTL_MS = 10 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const createOtp = () => crypto.randomInt(100000, 1000000).toString();

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const issueToken = (user) => {
  if (!process.env.JWT_SECRET) throw new Error("Server authentication is not configured.");
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const validateCredentials = ({ name, email, phone, password }, requireProfile = false) => {
  if (!EMAIL_PATTERN.test(normalizeEmail(email))) return "A valid email address is required.";
  if (!password || password.length < 8) return "Password must contain at least 8 characters.";
  if (requireProfile && (!String(name || "").trim() || !String(phone || "").trim())) return "Name and phone are required.";
  return null;
};

const saveOtp = async (email) => {
  const otp = createOtp();
  await prisma.user.update({
    where: { email },
    data: {
      emailVerificationOtp: hashToken(otp),
      emailVerificationOtpExpires: new Date(Date.now() + OTP_TTL_MS),
      emailVerificationOtpAttempts: 0,
    },
  });
  await sendVerificationOtp(email, otp);
};

exports.register = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const validationError = validateCredentials(req.body, true);
    if (validationError) return res.status(400).json({ message: validationError });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    if (existingUser?.isEmailVerified) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    if (existingUser) {
      await prisma.user.update({
        where: { email },
        data: { name: req.body.name.trim(), phone: req.body.phone.trim(), password: hashedPassword },
      });
    } else {
      await prisma.user.create({
        data: { name: req.body.name.trim(), email, phone: req.body.phone.trim(), password: hashedPassword },
      });
    }

    await saveOtp(email);
    res.status(existingUser ? 200 : 201).json({
      message: "Registration successful! Verification OTP sent to email.",
      requireVerification: true,
      email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Unable to register right now. Please try again." });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ message: "A valid email address is required." });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isEmailVerified) return res.status(400).json({ message: "This email cannot be verified." });
    await saveOtp(email);
    res.json({ message: "A fresh 6-digit OTP has been sent to your email." });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Unable to send an OTP right now." });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "");
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.emailVerificationOtp || !user.emailVerificationOtpExpires || user.emailVerificationOtpExpires <= new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please request a new one." });
    }
    if (user.emailVerificationOtpAttempts >= 5) return res.status(429).json({ message: "Too many invalid OTP attempts. Please request a new OTP." });
    if (hashToken(otp) !== user.emailVerificationOtp) {
      await prisma.user.update({ where: { id: user.id }, data: { emailVerificationOtpAttempts: { increment: 1 } } });
      return res.status(400).json({ message: "Invalid OTP code." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerificationOtp: null, emailVerificationOtpExpires: null, emailVerificationOtpAttempts: 0 },
    });
    res.json({ token: issueToken(updatedUser), user: publicUser(updatedUser) });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Unable to verify the OTP right now." });
  }
};

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const validationError = validateCredentials({ email, password: req.body.password });
    if (validationError) return res.status(400).json({ message: "Invalid credentials." });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(400).json({ message: "Invalid credentials." });

    if (!user.isEmailVerified) {
      await saveOtp(email);
      return res.status(403).json({ message: "Your email is unverified. A fresh OTP has been sent.", requireVerification: true, email });
    }
    res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Unable to sign in right now." });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ message: "A valid email address is required." });
    const user = await prisma.user.findUnique({ where: { email } });
    // Do not reveal whether an account exists.
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: hashToken(resetToken), resetPasswordExpires: new Date(Date.now() + RESET_TTL_MS) },
      });
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      await sendResetPasswordEmail(email, `${frontendUrl}/?resetToken=${encodeURIComponent(resetToken)}`);
    }
    res.json({ message: "If an account exists for that email, a password reset link has been sent." });
  } catch (error) {
    console.error("Forgot-password error:", error);
    res.status(500).json({ message: "Unable to process the request right now." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const token = String(req.body.token || "");
    const newPassword = String(req.body.newPassword || "");
    if (!token || newPassword.length < 8) return res.status(400).json({ message: "A valid token and an 8-character password are required." });
    const user = await prisma.user.findFirst({ where: { resetPasswordToken: hashToken(token), resetPasswordExpires: { gt: new Date() } } });
    if (!user) return res.status(400).json({ message: "Invalid or expired password reset token." });
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, 12), resetPasswordToken: null, resetPasswordExpires: null },
    });
    res.json({ message: "Password reset successful! You can now sign in." });
  } catch (error) {
    console.error("Reset-password error:", error);
    res.status(500).json({ message: "Unable to reset the password right now." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    res.json(await prisma.user.findMany({ select: { id: true, name: true, email: true, phone: true, role: true, isEmailVerified: true } }));
  } catch (error) {
    res.status(500).json({ message: "Unable to load users." });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !["CUSTOMER", "ADMIN"].includes(role)) return res.status(400).json({ message: "A valid user and role are required." });
    if (userId === req.user.id) return res.status(400).json({ message: "You cannot change your own role." });
    const user = await prisma.user.update({ where: { id: userId }, data: { role }, select: { id: true, name: true, email: true, phone: true, role: true, isEmailVerified: true } });
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: "User not found." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: "You cannot delete your own account." });
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: "User not found." });
  }
};
