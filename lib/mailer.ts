import nodemailer from "nodemailer"

function hasEmailConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_FROM,
  )
}

export type MailDeliveryResult =
  | { mode: "smtp" }
  | { mode: "preview"; previewCode: string }

export async function sendVerificationCodeEmail({
  to,
  code,
  title,
  message,
}: {
  to: string
  code: string
  title: string
  message: string
}): Promise<MailDeliveryResult> {
  if (!hasEmailConfig()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`Email preview for ${to}: ${code}`)
      return {
        mode: "preview",
        previewCode: code,
      }
    }

    throw new Error("SMTP email delivery is not configured.")
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `${title} | Ochieng Store`,
    text: `${message}\n\nVerification code: ${code}\n\nThis code expires in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #102552; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h1 style="margin: 0 0 12px; font-size: 24px;">${title}</h1>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6;">${message}</p>
        <div style="margin: 0 0 20px; border-radius: 18px; background: #102552; color: #f3c553; font-size: 32px; font-weight: 700; letter-spacing: 0.3em; padding: 18px 24px; text-align: center;">
          ${code}
        </div>
        <p style="margin: 0; font-size: 13px; color: #4a5568;">This verification code expires in 15 minutes.</p>
      </div>
    `,
  })

  return {
    mode: "smtp",
  }
}
