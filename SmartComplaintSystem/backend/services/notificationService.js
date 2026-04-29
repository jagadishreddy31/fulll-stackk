const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email notification
 */
const sendEmail = async (to, subject, htmlBody) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[Email skipped - not configured] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"CivicConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlBody,
    });
    console.log(`[Email sent] To: ${to} | Subject: ${subject}`);
  } catch (err) {
    console.error('[Email error]', err.message);
  }
};

/**
 * Send OTP email for password reset
 */
const sendOTPEmail = async (email, name, otp) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="color:#2563eb;margin-bottom:8px;">Password Reset OTP</h2>
      <p style="color:#374151;">Hi <strong>${name}</strong>,</p>
      <p style="color:#374151;">You requested to reset your CivicConnect password. Use the OTP below:</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#1d4ed8;background:#eff6ff;padding:16px 24px;border-radius:8px;display:inline-block;">${otp}</span>
      </div>
      <p style="color:#6b7280;font-size:14px;">This OTP expires in <strong>10 minutes</strong>.</p>
      <p style="color:#6b7280;font-size:14px;">If you did not request this, ignore this email.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
      <p style="color:#9ca3af;font-size:12px;">CivicConnect - Smart Municipal Complaint System</p>
    </div>
  `;
  await sendEmail(email, 'Your CivicConnect OTP Code', html);
};

/**
 * Send complaint status notification email
 */
const sendStatusEmail = async (email, name, complaintTitle, newStatus) => {
  const statusColors = {
    'Registered': '#2563eb',
    'In Progress': '#d97706',
    'Resolved': '#16a34a',
    'Escalated': '#dc2626',
    'Cancelled': '#6b7280',
  };
  const color = statusColors[newStatus] || '#374151';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="color:#2563eb;margin-bottom:8px;">Complaint Status Update</h2>
      <p style="color:#374151;">Hi <strong>${name}</strong>,</p>
      <p style="color:#374151;">Your complaint <strong>"${complaintTitle}"</strong> has been updated:</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="font-size:20px;font-weight:bold;color:white;background:${color};padding:10px 24px;border-radius:8px;display:inline-block;">${newStatus}</span>
      </div>
      <p style="color:#6b7280;font-size:14px;">Login to CivicConnect to view full details and communicate with officers.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
      <p style="color:#9ca3af;font-size:12px;">CivicConnect - Smart Municipal Complaint System</p>
    </div>
  `;
  await sendEmail(email, `Complaint Update: ${newStatus} - ${complaintTitle}`, html);
};

/**
 * Send complaint registration confirmation email
 */
const sendRegistrationEmail = async (email, name, complaintTitle) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="color:#16a34a;margin-bottom:8px;">Complaint Registered Successfully</h2>
      <p style="color:#374151;">Hi <strong>${name}</strong>,</p>
      <p style="color:#374151;">Your complaint <strong>"${complaintTitle}"</strong> has been registered and assigned to the relevant department.</p>
      <p style="color:#374151;">Our team will review and take action within the SLA timeframe.</p>
      <p style="color:#6b7280;font-size:14px;">Track the status of your complaint by logging into CivicConnect.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
      <p style="color:#9ca3af;font-size:12px;">CivicConnect - Smart Municipal Complaint System</p>
    </div>
  `;
  await sendEmail(email, `Complaint Registered: ${complaintTitle}`, html);
};

module.exports = { sendEmail, sendOTPEmail, sendStatusEmail, sendRegistrationEmail };
