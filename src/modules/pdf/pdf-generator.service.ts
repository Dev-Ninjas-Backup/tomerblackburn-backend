import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { existsSync } from 'fs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as new (
  options?: PDFKit.PDFDocumentOptions,
) => PDFKit.PDFDocument;

export interface SubmissionPdfData {
  submissionNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectAddress: string;
  zipCode?: string;
  logoUrl?: string;
  tagline?: string;
  service: {
    name: string;
    code: string;
    scopeDescription?: string;
  };
  basePrice: number;
  markup: number;
  clientPrice: number;
  additionalItemsTotal: number;
  totalAmount: number;
  submittedAt: Date;
  includedBaseItems: Array<{
    itemName: string;
    itemDescription?: string;
  }>;
  items: Array<{
    itemName: string;
    itemDescription?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    selectedOptionName?: string;
    isEnabled: boolean;
  }>;
  projectNotes?: string;
  buildingType?: string;
  buildingTypePrice?: number;
}

@Injectable()
export class PdfGeneratorService {
  private readonly primaryColor = '#1a365d';
  private readonly secondaryColor = '#2d3748';
  private readonly accentColor = '#3182ce';
  private readonly lightGray = '#e2e8f0';
  private readonly footerReserve = 60;
  private lastItemY = 0;

  async generateSubmissionPdf(data: SubmissionPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const pdfTagline = this.normalizeTaglineForPdf(data.tagline);
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          info: {
            Title: `Estimate ${data.submissionNumber}`,
            Author: 'BBurn Builders',
            Subject: `${pdfTagline ?? 'Estimate'} for ${data.clientName}`,
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err: Error) => reject(err));

        this.addHeader(doc, data);
        this.addClientInfo(doc, data);
        this.addProjectSummary(doc, data);
        this.addLineItems(doc, data);
        this.addTotals(doc, data);
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument, data: SubmissionPdfData): void {
    const logoSize = 36;
    const logoX = 50;
    const logoY = 45;
    const textX = logoX + logoSize + 10;

    // Try local logo.png
    const localLogoPath = path.join(process.cwd(), 'logo.png');
    let logoDrawn = false;

    if (existsSync(localLogoPath)) {
      try {
        doc.image(localLogoPath, logoX, logoY, {
          width: logoSize,
          height: logoSize,
        });
        logoDrawn = true;
      } catch {
        /* fallback */
      }
    }

    if (!logoDrawn && data.logoUrl) {
      try {
        doc.image(data.logoUrl, logoX, logoY, {
          width: logoSize,
          height: logoSize,
        });
        logoDrawn = true;
      } catch {
        /* fallback */
      }
    }

    if (!logoDrawn) {
      doc.rect(logoX, logoY, logoSize, logoSize).fillColor('#e2e8f0').fill();
    }

    // Company name
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text('BBurn Builders', textX, logoY + 4);

    const tagline =
      this.normalizeTaglineForPdf(data.tagline) ??
      'Premium Home Remodeling Services';
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.secondaryColor)
      .text(tagline, textX, logoY + 26);

    // Estimate # and Date right side
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.secondaryColor)
      .text(`Estimate #: ${data.submissionNumber}`, 400, logoY + 4, {
        align: 'right',
      })
      .text(`Date: ${this.formatDate(data.submittedAt)}`, 400, logoY + 18, {
        align: 'right',
      });

    const lineY = logoY + logoSize + 10;
    doc
      .moveTo(50, lineY)
      .lineTo(545, lineY)
      .strokeColor(this.lightGray)
      .lineWidth(1.5)
      .stroke();

    doc.y = lineY + 8;
  }

  private addClientInfo(
    doc: PDFKit.PDFDocument,
    data: SubmissionPdfData,
  ): void {
    const startY = doc.y;

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text('CLIENT INFORMATION', 50, startY);

    const ciY = startY + 16;
    doc.fontSize(9).font('Helvetica').fillColor(this.secondaryColor);
    doc.text(`Name: ${data.clientName}`, 50, ciY);
    doc.text(`Email: ${data.clientEmail}`, 50, ciY + 13);
    doc.text(`Phone: ${data.clientPhone}`, 50, ciY + 26);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text('PROJECT ADDRESS', 300, startY);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.secondaryColor)
      .text(data.projectAddress, 300, ciY, { width: 245 });

    if (data.zipCode) {
      doc.text(`Zip Code: ${data.zipCode}`, 300, ciY + 26);
    }

    const lineY = ciY + 44;
    doc
      .moveTo(50, lineY)
      .lineTo(545, lineY)
      .strokeColor(this.lightGray)
      .lineWidth(1)
      .stroke();

    doc.y = lineY + 8;
  }

  private addProjectSummary(
    doc: PDFKit.PDFDocument,
    data: SubmissionPdfData,
  ): void {
    const startY = doc.y;
    const boxHeight = data.buildingType ? 58 : 38;

    doc.rect(50, startY, 512, boxHeight).fillColor('#f7fafc').fill();

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text('PROJECT TYPE', 60, startY + 7);

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor(this.accentColor)
      .text(`${data.service.name} Bathroom Renovation`, 60, startY + 20);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.secondaryColor)
      .text(`Code: ${data.service.code}`, 450, startY + 20, { align: 'right' });

    if (data.buildingType) {
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(this.primaryColor)
        .text('Building Type:', 60, startY + 40);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(this.secondaryColor)
        .text(data.buildingType, 450, startY + 40, { align: 'right' });
    }

    doc.y = startY + boxHeight + 6;
  }

  private addLineItems(doc: PDFKit.PDFDocument, data: SubmissionPdfData): void {
    let currentY = doc.y;
    const baseRowHeight = 22;
    const maxContentY = () => this.getMaxContentY(doc);

    // SCOPE OF WORK title — smaller
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text('SCOPE OF WORK', 50, currentY);

    currentY += 20;

    // Table header
    doc.rect(50, currentY, 512, 22).fillColor(this.primaryColor).fill();
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('Description', 55, currentY + 7)
      .text('Total', 480, currentY + 7);

    currentY += 22;

    // Base price row
    if (data.basePrice > 0) {
      const includedItems = data.includedBaseItems || [];
      const scopeDescH = data.service.scopeDescription
        ? doc.heightOfString(data.service.scopeDescription, { width: 420 }) + 4
        : 0;
      const headerBlockHeight = 22 + scopeDescH + 4;

      // Check page break for the header block
      if (currentY + headerBlockHeight > maxContentY()) {
        doc.addPage({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });
        currentY = 50;
      }

      // Draw background for header block
      doc
        .rect(50, currentY, 512, headerBlockHeight)
        .fillColor('#f7fafc')
        .fill();

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(this.secondaryColor)
        .text(
          `Base Price - ${data.service.name} Bathroom Renovation (Scope of Work)`,
          55,
          currentY + 7,
          { width: 420 },
        );

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(this.secondaryColor)
        .text(this.formatCurrency(data.basePrice), 480, currentY + 7);

      if (data.service.scopeDescription) {
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#718096')
          .text(data.service.scopeDescription, 55, currentY + 22, {
            width: 420,
          });
      }

      currentY += headerBlockHeight;

      if (includedItems.length > 0) {
        const startPadding = 4;
        if (currentY + startPadding > maxContentY()) {
          doc.addPage({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
          });
          currentY = 50;
        }
        doc.rect(50, currentY, 512, startPadding).fillColor('#f7fafc').fill();
        currentY += startPadding;

        for (const item of includedItems) {
          const nameH = doc.heightOfString(`• ${item.itemName}`, {
            width: 400,
          });
          const descH = item.itemDescription
            ? doc.heightOfString(item.itemDescription, { width: 390 })
            : 0;
          const itemHeight = nameH + (descH ? descH + 2 : 0) + 4;

          if (currentY + itemHeight > maxContentY()) {
            doc.addPage({
              size: 'A4',
              margins: { top: 50, bottom: 50, left: 50, right: 50 },
            });
            currentY = 50;
          }

          // Draw background for this item row
          doc.rect(50, currentY, 512, itemHeight).fillColor('#f7fafc').fill();

          // Draw item name
          doc
            .fontSize(8)
            .font('Helvetica-Bold')
            .fillColor('#4a5568')
            .text(`• ${item.itemName}`, 65, currentY + 2, { width: 400 });

          // Draw description if exists
          if (item.itemDescription) {
            doc
              .fontSize(7)
              .font('Helvetica')
              .fillColor('#718096')
              .text(item.itemDescription, 75, currentY + 2 + nameH + 2, {
                width: 390,
              });
          }

          currentY += itemHeight;
        }

        const endPadding = 4;
        if (currentY + endPadding > maxContentY()) {
          doc.addPage({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
          });
          currentY = 50;
        }
        doc.rect(50, currentY, 512, endPadding).fillColor('#f7fafc').fill();
        currentY += endPadding;
      }
    }

    // Additional items
    const enabledItems = data.items.filter(
      (item) => item.isEnabled && item.totalPrice > 0,
    );

    if (enabledItems.length > 0) {
      // Small gap + ADDITIONAL ITEMS sub-header
      currentY += 4;
      if (currentY + 20 > maxContentY()) {
        doc.addPage({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });
        currentY = 50;
      }
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(this.primaryColor)
        .text('ADDITIONAL ITEMS', 55, currentY);
      currentY += 14;
    }

    for (let i = 0; i < enabledItems.length; i++) {
      const item = enabledItems[i];

      let itemText = item.itemName || 'Item';
      if (item.selectedOptionName) itemText += ` (${item.selectedOptionName})`;

      const descH = item.itemDescription
        ? doc.heightOfString(item.itemDescription, { width: 280 })
        : 0;
      const rowHeight = baseRowHeight + descH + (item.itemDescription ? 4 : 0);

      if (currentY + rowHeight > maxContentY()) {
        doc.addPage({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });
        currentY = 50;
      }

      // i+1 so alternating starts white after gray base price row
      if ((i + 1) % 2 === 0) {
        doc.rect(50, currentY, 512, rowHeight).fillColor('#f7fafc').fill();
      }

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(this.secondaryColor)
        .text(itemText, 55, currentY + 6, { width: 280, lineBreak: false });

      if (item.itemDescription) {
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#718096')
          .text(item.itemDescription, 55, currentY + 18, { width: 280 });
      }

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(this.secondaryColor)
        .text(this.formatCurrency(item.totalPrice), 480, currentY + 6);

      currentY += rowHeight;
    }

    this.lastItemY = currentY;
  }

  private addTotals(doc: PDFKit.PDFDocument, data: SubmissionPdfData): void {
    let currentY = this.lastItemY;
    const notesMaxHeight = 80;
    const maxContentY = this.getMaxContentY(doc);

    // Calculate totals block height
    let totalsHeight = 20 + 15; // gap + line
    totalsHeight += 20; // base price
    if (data.markup > 0) totalsHeight += 40; // markup + client price
    totalsHeight += 20; // additional items
    if (
      data.buildingType &&
      data.buildingTypePrice &&
      data.buildingTypePrice > 0
    )
      totalsHeight += 35;
    totalsHeight += 15 + 15 + 20; // line + total label

    const notesHeight = data.projectNotes
      ? Math.min(
          doc.heightOfString(data.projectNotes, { width: 512 }),
          notesMaxHeight,
        ) + 40
      : 0;

    if (currentY + totalsHeight + notesHeight > maxContentY) {
      doc.addPage({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });
      currentY = 50;
    }

    currentY += 20;
    const totalsX = 350;

    doc
      .moveTo(totalsX, currentY)
      .lineTo(545, currentY)
      .strokeColor(this.lightGray)
      .lineWidth(1)
      .stroke();

    currentY += 15;

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(this.secondaryColor)
      .text('Base Price:', totalsX, currentY)
      .text(this.formatCurrency(data.basePrice), 480, currentY);

    currentY += 20;

    if (data.markup > 0) {
      doc
        .text(`Markup (${data.markup}%):`, totalsX, currentY)
        .text(
          this.formatCurrency(data.clientPrice - data.basePrice),
          480,
          currentY,
        );
      currentY += 20;

      doc
        .text('Client Price:', totalsX, currentY)
        .text(this.formatCurrency(data.clientPrice), 480, currentY);
      currentY += 20;
    }

    doc
      .text('Additional Items:', totalsX, currentY)
      .text(this.formatCurrency(data.additionalItemsTotal), 480, currentY);
    currentY += 20;

    if (
      data.buildingType &&
      data.buildingTypePrice &&
      data.buildingTypePrice > 0
    ) {
      doc
        .text('Building Type:', totalsX, currentY)
        .text(this.formatCurrency(data.buildingTypePrice), 480, currentY);
      currentY += 15;
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#718096')
        .text(data.buildingType, totalsX, currentY);
      currentY += 20;
    }

    doc
      .moveTo(totalsX, currentY)
      .lineTo(545, currentY)
      .strokeColor(this.primaryColor)
      .lineWidth(2)
      .stroke();

    currentY += 15;

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text('TOTAL ESTIMATE:', totalsX, currentY)
      .text(this.formatCurrency(data.totalAmount), 460, currentY);

    if (data.projectNotes) {
      currentY += 40;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(this.primaryColor)
        .text('PROJECT NOTES', 50, currentY);

      currentY += 18;
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(this.secondaryColor)
        .text(data.projectNotes, 50, currentY, {
          width: 512,
          height: notesMaxHeight,
          ellipsis: true,
        });
    }
  }

  private getMaxContentY(doc: PDFKit.PDFDocument): number {
    return doc.page.height - doc.page.margins.bottom - this.footerReserve;
  }

  private addFooter(doc: PDFKit.PDFDocument): void {
    const footerHeight = 60;
    const footerY = doc.page.height - doc.page.margins.bottom - footerHeight;

    doc
      .moveTo(50, footerY)
      .lineTo(545, footerY)
      .strokeColor(this.lightGray)
      .lineWidth(1)
      .stroke();

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#718096')
      .text(
        'This estimate is valid for 30 days from the date of issue. Prices are subject to change based on final site inspection. ' +
          'Additional costs may apply for unforeseen conditions. This is an estimate only and not a binding contract.',
        50,
        footerY + 10,
        { width: 512, height: 26, align: 'center', ellipsis: true },
      );

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text(
        'BBurn Builders | info@bburnbuilders.com | (312) 555-1234',
        50,
        footerY + 40,
        { width: 512, align: 'center' },
      );
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  private normalizeTaglineForPdf(tagline?: string): string | undefined {
    if (!tagline) return undefined;
    const normalized = tagline.replace(/\s+in\s+[A-Za-z\s]+$/i, '').trim();
    return normalized || tagline;
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  }
}
