const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a password reset email with a reset link
 */
const sendPasswordResetEmail = async (toEmail, userName, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"DataVault Support" <${process.env.EMAIL}>`,
    to: toEmail,
    subject: "Password Reset Request - DataVault",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #2563eb, #7c3aed); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 28px;">🔐</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0;">Password Reset Request</h1>
          </div>

          <!-- Body -->
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password for your DataVault account. Click the button below to reset it.
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 16px; display: inline-block;">
              Reset My Password
            </a>
          </div>

          <!-- Warning -->
          <div style="background: #fef9c3; border: 1px solid #fde047; border-radius: 10px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #713f12; font-size: 14px;">
              ⚠️ This link will expire in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email — your account is safe.
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 32px;">
            If the button doesn't work, paste this link in your browser:<br/>
            <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
          </p>

          <!-- Footer -->
          <div style="border-top: 1px solid #f1f5f9; margin-top: 32px; padding-top: 24px; text-align: center;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">
              Designed & Developed by Veagle Space Technology Pvt. Ltd. | © 2026 All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };
