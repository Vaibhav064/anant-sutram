const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a verification email to the user.
 * @param {string} toEmail - Recipient email address
 * @param {string} token   - Verification token
 */
async function sendVerificationEmail(toEmail, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: `"Anant Sutram" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '✨ Verify your Anant Sutram account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { background: #0F0A1E; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; }
          .wrapper { max-width: 520px; margin: 40px auto; background: #1A1030; border-radius: 24px; overflow: hidden; box-shadow: 0 0 60px rgba(138,43,226,0.2); }
          .header { background: linear-gradient(135deg, #6C3CE1, #A855F7); padding: 40px 40px 30px; text-align: center; }
          .header h1 { color: #fff; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
          .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
          .body { padding: 36px 40px; }
          .body p { color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7; margin: 0 0 24px; }
          .btn { display: block; width: fit-content; margin: 0 auto; background: linear-gradient(135deg, #6C3CE1, #A855F7); color: #fff; font-weight: 700; font-size: 16px; text-decoration: none; padding: 16px 48px; border-radius: 14px; letter-spacing: 0.3px; }
          .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; color: rgba(255,255,255,0.3); font-size: 12px; }
          .expire { margin-top: 28px; color: rgba(255,255,255,0.4); font-size: 13px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>🌸 Anant Sutram</h1>
            <p>Your healing journey begins here</p>
          </div>
          <div class="body">
            <p>Thank you for creating your account. Please verify your email address to activate your account and start your healing journey.</p>
            <a href="${verifyUrl}" class="btn">Verify Email Address</a>
            <p class="expire">This link expires in <strong>24 hours</strong>.</p>
          </div>
          <div class="footer">
            If you didn't create an account, you can safely ignore this email.<br/>
            © 2025 Anant Sutram. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

module.exports = { sendVerificationEmail };
