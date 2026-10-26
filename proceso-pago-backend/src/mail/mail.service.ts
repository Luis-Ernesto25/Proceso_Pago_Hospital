import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface AdjuntoPdf {
  filename: string;
  content: Buffer;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT ?? 587),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async enviarConPdf(opciones: {
    destinatario: string;
    asunto: string;
    html: string;
    adjuntos: AdjuntoPdf[];
  }): Promise<void> {
    const from = process.env.MAIL_FROM ?? process.env.MAIL_USER!;
    try {
      const info = await this.transporter.sendMail({
        from,
        to: opciones.destinatario,
        subject: opciones.asunto,
        html: opciones.html,
        attachments: opciones.adjuntos.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: 'application/pdf',
        })),
      });
      this.logger.log(
        `Correo enviado a ${opciones.destinatario} (${info.messageId})`,
      );
    } catch (error) {
      this.logger.error(
        `Error enviando correo a ${opciones.destinatario}`,
        error,
      );
      throw error;
    }
  }
}