/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { env } from "../../app/config/env";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import path from "path";
import ejs from "ejs";

export const transport = nodemailer.createTransport({
  host: env.EMAIL_SENDER.SMTP_HOST,
  port: Number(env.EMAIL_SENDER.SMTP_PORT),
  secure: Number(env.EMAIL_SENDER.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: env.EMAIL_SENDER.SMTP_USER,
    pass: env.EMAIL_SENDER.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.resolve(
      process.cwd(),
      `src/app/templates/${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transport.sendMail({
      from: `"PH Healthcare" <${env.EMAIL_SENDER.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error: any) {
    console.log("Error sending email : ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};
