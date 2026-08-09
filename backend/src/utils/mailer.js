require("dotenv").config();

const { Resend } = require("resend");

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not configured.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const getFromAddress = () => {
  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is not configured.");
  }

  return `"Paras Dry Fruits & Spices" <${process.env.EMAIL_FROM}>`;
};

/**
 * Send verification OTP
 */
exports.sendVerificationOtp = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [email],
      subject: `Your Verification Code: ${otp} - Paras Dry Fruits & Spices`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #F4F6F5;
              margin: 0;
              padding: 20px;
            }

            .container {
              max-width: 550px;
              margin: auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
            }

            .header {
              background: #1A2B22;
              padding: 30px;
              text-align: center;
              border-bottom: 3px solid #D4AF37;
            }

            .brand {
              color: #D4AF37;
              font-size: 26px;
              font-weight: bold;
              margin: 0;
            }

            .body {
              padding: 40px 30px;
              text-align: center;
            }

            .otp {
              display: inline-block;
              background: #FAF8F5;
              border: 2px dashed #D4AF37;
              border-radius: 16px;
              padding: 20px 30px;
              margin: 20px 0;
              font-size: 38px;
              font-weight: 800;
              letter-spacing: 10px;
              color: #2B4C3F;
            }

            .footer {
              background: #F8FAFC;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #A0AEC0;
            }
          </style>
        </head>

        <body>
          <div class="container">

            <div class="header">
              <h1 class="brand">Paras</h1>
              <div style="color:#A3B899;font-size:11px;">
                DRY FRUITS & AUTHENTIC SPICES
              </div>
            </div>

            <div class="body">
              <h2>Verify Your Email Address</h2>

              <p>
                Welcome to Paras Dry Fruits & Spices!
                Use the OTP below to complete your registration.
              </p>

              <div class="otp">
                ${otp}
              </div>

              <p style="font-size:12px;color:#888;">
                This OTP is valid for 10 minutes.
              </p>

              <p style="font-size:12px;color:#aaa;">
                If you did not request this code, you can safely ignore this email.
              </p>
            </div>

            <div class="footer">
              © 2026 Paras Dry Fruits & Spices.
            </div>

          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend OTP error:", error);
      throw new Error("Unable to send verification email.");
    }

    console.log("Verification email sent:", data?.id);

    return data;
  } catch (error) {
    console.error("Verification email error:", error);
    throw error;
  }
};

/**
 * Send password reset email
 */
exports.sendResetPasswordEmail = async (email, resetUrl) => {
  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [email],
      subject: "Reset Your Password - Paras Dry Fruits & Spices",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial;background:#F4F6F5;padding:30px;">

          <div style="
            max-width:550px;
            margin:auto;
            background:white;
            padding:40px;
            border-radius:20px;
            text-align:center;
          ">

            <h1 style="color:#D4AF37;">
              Paras
            </h1>

            <h2>
              Password Reset Request
            </h2>

            <p style="color:#718096;">
              We received a request to reset your password.
            </p>

            <a
              href="${resetUrl}"
              style="
                display:inline-block;
                background:#2B4C3F;
                color:white;
                padding:14px 30px;
                border-radius:10px;
                text-decoration:none;
                font-weight:bold;
                margin:20px 0;
              "
            >
              Reset Password
            </a>

            <p style="font-size:12px;color:#A0AEC0;">
              This link will expire in 1 hour.
            </p>

          </div>

        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend reset email error:", error);
      throw new Error("Unable to send password reset email.");
    }

    console.log("Password reset email sent:", data?.id);

    return data;
  } catch (error) {
    console.error("Password reset email error:", error);
    throw error;
  }
};
