import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error('NEXT_PUBLIC_APP_URL is not set in environment variables');
  }

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  try {
    console.log('Sending verification email to:', email);
    const { data, error } = await resend.emails.send({
      from: 'WaitLaunch <noreply@waitlaunch.com>',
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to WaitLaunch!</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Verification email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to send verification email');
  }
}

export function generateVerificationToken() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
} 