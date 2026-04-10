import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
  }
  return transporter;
}

export async function sendTicketApprovedEmail(opts: {
  subject: string;
  html: string;
}): Promise<void> {
  const to = process.env.DEMO_NOTIFY_EMAIL;
  if (!to) {
    if (process.env.NOTIFY_LOG === "true") {
      console.log("[notify:ticket-approved]", opts.subject);
    }
    return;
  }
  const tx = getTransporter();
  if (!tx) {
    console.log("[notify:ticket-approved]", to, opts.subject);
    return;
  }
  await tx.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: opts.subject,
    html: opts.html,
  });
}
