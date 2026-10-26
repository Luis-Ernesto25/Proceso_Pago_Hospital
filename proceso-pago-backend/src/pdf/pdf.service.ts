// src/pdf/pdf.service.ts
import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  /**
   * Genera un PDF con una tabla a partir de columnas y filas.
   * No hace consultas: el llamador pasa los datos ya listos.
   * Devuelve un Buffer listo para descargar o para adjuntar en un email.
   */
  async generarTablaPdf(
    columnas: string[],
    datos: string[][],
    opciones?: { titulo?: string; orientacion?: 'portrait' | 'landscape' },
  ): Promise<Buffer> {
    const titulo = opciones?.titulo ?? 'Reporte';
    const orientacion = opciones?.orientacion ?? 'landscape';

    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: orientacion,
          margin: 40,
          info: {
            Title: titulo,
            Author: 'Tu App',
            CreationDate: new Date(),
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => {
          this.logger.error('Error generando PDF', err);
          reject(err);
        });

        this.dibujarTabla(doc, columnas, datos, titulo);

        doc.end();
      } catch (error) {
        this.logger.error('Error generando PDF', error);
        reject(error);
      }
    });
  }

  // -------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------
  private dibujarTabla(
    doc: typeof PDFDocument.prototype,
    columnas: string[],
    datos: string[][],
    titulo: string,
  ) {
    const marginX = 40;
    const marginY = 40;
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const tableWidth = pageWidth - marginX * 2;

    const headerHeightMin = 28;
    const rowHeightMin = 24;
    const cellPadding = 6;
    const fontSize = 9;
    const lineGap = 2;

    // 👇 Anchos proporcionales al contenido
    const anchos = this.calcularAnchosColumnas(
      doc,
      columnas,
      datos,
      tableWidth,
      fontSize,
      cellPadding,
    );

    // --- Título ---
    let y = marginY;
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#111111')
      .text(titulo, marginX, y, { width: tableWidth, align: 'center' });
    y += 28;

    // --- Cabecera (se reutiliza al cambiar de página) ---
    const dibujarCabecera = () => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      const alturasHeader = columnas.map((col, i) =>
        doc.heightOfString(col, {
          width: anchos[i] - cellPadding * 2,
          lineGap,
        }),
      );
      const headerHeight = Math.max(
        headerHeightMin,
        Math.max(...alturasHeader) + cellPadding * 2,
      );

      doc.rect(marginX, y, tableWidth, headerHeight).fill('#f2f2f2');
      doc.fillColor('#111111').font('Helvetica-Bold').fontSize(fontSize);

      let x = marginX;
      columnas.forEach((col, i) => {
        doc.text(col, x + cellPadding, y + cellPadding, {
          width: anchos[i] - cellPadding * 2,
          align: 'left',
          lineGap,
        });
        x += anchos[i];
      });

      doc
        .moveTo(marginX, y + headerHeight)
        .lineTo(marginX + tableWidth, y + headerHeight)
        .strokeColor('#c0c0c0')
        .lineWidth(0.5)
        .stroke();

      y += headerHeight;
    };

    dibujarCabecera();

    // --- Filas ---
    datos.forEach((fila, rowIdx) => {
      // 1) Altura de esta fila = máximo de las alturas de sus celdas
      doc.font('Helvetica').fontSize(fontSize);
      const alturasCeldas = columnas.map((_, colIdx) => {
        const valor = String(fila[colIdx] ?? '');
        return doc.heightOfString(valor, {
          width: anchos[colIdx] - cellPadding * 2,
          lineGap,
        });
      });
      const alturaFila = Math.max(
        rowHeightMin,
        Math.max(...alturasCeldas) + cellPadding * 2,
      );

      // 2) ¿Cabe? Si no, salto de página
      if (y + alturaFila > pageHeight - marginY) {
        doc.addPage({
          size: 'A4',
          layout: doc.page.layout as 'portrait' | 'landscape',
        });
        y = marginY;
        dibujarCabecera();
      }

      // 3) Fondo alterno (cebra)
      if (rowIdx % 2 === 1) {
        doc.rect(marginX, y, tableWidth, alturaFila).fill('#fafafa');
      }

      // 4) Texto de celdas (SIN ellipsis → envuelve)
      doc.fillColor('#333333').font('Helvetica').fontSize(fontSize);
      let x = marginX;
      columnas.forEach((_, colIdx) => {
        const valor = String(fila[colIdx] ?? '');
        doc.text(valor, x + cellPadding, y + cellPadding, {
          width: anchos[colIdx] - cellPadding * 2,
          align: 'left',
          lineGap,
        });
        x += anchos[colIdx];
      });

      // 5) Línea separadora
      doc
        .moveTo(marginX, y + alturaFila)
        .lineTo(marginX + tableWidth, y + alturaFila)
        .strokeColor('#e0e0e0')
        .lineWidth(0.5)
        .stroke();

      y += alturaFila;
    });

    // --- Pie de página ---
    if (y + 20 > pageHeight - marginY) {
      doc.addPage({
        size: 'A4',
        layout: doc.page.layout as 'portrait' | 'landscape',
      });
      y = marginY;
    }
    doc
      .font('Helvetica-Oblique')
      .fontSize(8)
      .fillColor('#888888')
      .text(
        `Total de filas: ${datos.length} · Generado el ${new Date().toLocaleString('es-ES')}`,
        marginX,
        y + 10,
        { width: tableWidth, align: 'right' },
      );
  }

  /**
   * Calcula el ancho de cada columna en función del contenido
   * (cabecera + todas las celdas) y del ancho total disponible.
   */
  private calcularAnchosColumnas(
    doc: typeof PDFDocument.prototype,
    columnas: string[],
    datos: string[][],
    tableWidth: number,
    fontSize: number,
    cellPadding: number,
  ): number[] {
    // 1) Ancho natural = máximo entre la cabecera y todas las celdas de la columna
    const anchosNaturales = columnas.map((col, idx) => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      let maxAncho = doc.widthOfString(col);

      doc.font('Helvetica').fontSize(fontSize);
      for (const fila of datos) {
        const valor = String(fila[idx] ?? '');
        const w = doc.widthOfString(valor);
        if (w > maxAncho) maxAncho = w;
      }

      // padding a ambos lados + un pequeño margen de seguridad
      return maxAncho + cellPadding * 2 + 6;
    });

    const sumaNatural = anchosNaturales.reduce((a, b) => a + b, 0) || 1;

    // 2) Distribuir proporcionalmente al contenido
    let anchos = anchosNaturales.map((w) => (w / sumaNatural) * tableWidth);

    // 3) Clamp: ni columnas microscópicas ni columnas que se coman la tabla
    const MIN_RATIO = 0.08; // 8% mínimo
    const MAX_RATIO = 0.45; // 45% máximo
    const minW = tableWidth * MIN_RATIO;
    const maxW = tableWidth * MAX_RATIO;
    anchos = anchos.map((w) => Math.max(minW, Math.min(maxW, w)));

    // 4) Renormalizar para que sumen exactamente tableWidth
    const sumaAjustada = anchos.reduce((a, b) => a + b, 0);
    anchos = anchos.map((w) => (w / sumaAjustada) * tableWidth);

    return anchos;
  }
}