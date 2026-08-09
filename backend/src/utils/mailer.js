const nodemailer = require("nodemailer");
require("dotenv").config();

// Create SMTP Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP connection on server start
transporter.verify((error, success) => {
  if (error) {
    console.error(
      "❌ Email Transporter Error (Check .env EMAIL_USER & EMAIL_PASS):",
      error.message,
    );
  } else {
    console.log(
      "✅ Email Transporter Ready: Successfully connected to SMTP server.",
    );
  }
});

/**
 * 1. SEND ATTRACTIVE BRANDED OTP EMAIL
 */
exports.sendVerificationOtp = async (email, otp) => {
  const mailOptions = {
    from: `"Paras Dry Fruits & Spices" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Verification Code: ${otp} - Paras Dry Fruits & Spices`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F4F6F5; margin: 0; padding: 20px; }
          .container { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
          .header { background-color: #1A2B22; padding: 30px; text-align: center; border-bottom: 3px solid #D4AF37; }
          .brand-name { color: #D4AF37; font-size: 26px; font-weight: bold; font-family: Georgia, serif; margin: 0; }
          .brand-sub { color: #A3B899; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
          .body { padding: 40px 30px; text-align: center; color: #2D3748; }
          .title { font-size: 20px; font-weight: bold; margin-bottom: 12px; color: #1A2B22; }
          .subtitle { font-size: 14px; color: #718096; line-height: 1.5; margin-bottom: 30px; }
          .otp-box { background: #FAF8F5; border: 2px dashed #D4AF37; border-radius: 16px; padding: 20px; display: inline-block; margin: 0 auto 30px; }
          .otp-code { font-size: 38px; font-weight: 800; color: #2B4C3F; letter-spacing: 10px; margin: 0; font-mono: monospace; }
          .otp-timer { font-size: 12px; color: #E67E22; font-weight: 600; margin-top: 8px; }
          .footer { background: #F8FAFC; padding: 20px; text-align: center; font-size: 12px; color: #A0AEC0; border-t: 1 border-gray-100; }
          .badge { display: inline-block; background: #E6F4EA; color: #2B4C3F; font-size: 11px; font-weight: bold; padding: 6px 14px; rounded-radius: 20px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand-name">Paras</h1>
            <div class="brand-sub">Dry Fruits & Authentic Spices</div>
          </div>
          
          <div class="body">
            <h2 class="title">Verify Your Email Address</h2>
            <p class="subtitle">Welcome to Paras Dry Fruits & Spices! Please use the One-Time Password (OTP) below to complete your account registration.</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <div class="otp-timer">⏱️ Valid for 10 Minutes Only</div>
            </div>

            <p style="font-size: 12px; color: #A0AEC0; margin: 0;">If you did not request this verification code, please ignore this email or contact support.</p>
            
            <div style="margin-top: 25px;">
              <span class="badge">🌿 100% Organic & Export Grade Quality Guarantee</span>
            </div>
          </div>

          <div class="footer">
            &copy; 2026 Paras Dry Fruits & Spices. All Rights Reserved.<br/>
            Delivering authentic taste across India and worldwide.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * 2. SEND ATTRACTIVE PASSWORD RESET EMAIL
 */
exports.sendResetPasswordEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: `"Paras Dry Fruits & Spices" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password - Paras Dry Fruits & Spices",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F4F6F5; margin: 0; padding: 20px; }
          .container { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
          .header { background-color: #1A2B22; padding: 30px; text-align: center; border-bottom: 3px solid #D4AF37; }
          .brand-name { color: #D4AF37; font-size: 26px; font-weight: bold; font-family: Georgia, serif; margin: 0; }
          .brand-sub { color: #A3B899; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
          .body { padding: 40px 30px; text-align: center; color: #2D3748; }
          .title { font-size: 20px; font-weight: bold; margin-bottom: 12px; color: #1A2B22; }
          .subtitle { font-size: 14px; color: #718096; line-height: 1.5; margin-bottom: 30px; }
          .btn { display: inline-block; background-color: #2B4C3F; color: #ffffff !important; font-weight: bold; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(43, 76, 63, 0.3); }
          .footer { background: #F8FAFC; padding: 20px; text-align: center; font-size: 12px; color: #A0AEC0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand-name">Paras</h1>
            <div class="brand-sub">Dry Fruits & Authentic Spices</div>
          </div>
          
          <div class="body">
            <h2 class="title">Password Reset Request</h2>
            <p class="subtitle">We received a request to reset your password. Click the button below to set a new password for your account.</p>
            
            <div style="margin: 30px 0;">
              <a href="${resetUrl}" class="btn">Reset Password Now</a>
            </div>

            <p style="font-size: 12px; color: #A0AEC0;">This link will expire in 1 hour. If you did not request a password reset, no action is needed.</p>
          </div>

          <div class="footer">
            &copy; 2026 Paras Dry Fruits & Spices. All Rights Reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return await transporter.sendMail(mailOptions);
};
