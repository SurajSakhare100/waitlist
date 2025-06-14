import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

  try {
    await resend.emails.send({
      from: 'WaitLaunch <noreply@waitlaunch.com>',
      to: email,
      subject: 'Verify your email address',
      html: `
        <div>
          <h1>Welcome to WaitLaunch!</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${confirmLink}">Verify Email</a>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function getTokenExpiry() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
} 