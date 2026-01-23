import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

export interface SubmissionPdfData {
  submissionNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectAddress: string;
  zipCode?: string;
  service: {
    name: string;
    code: string;
  };
  basePrice: number;
  additionalItemsTotal: number;
  totalAmount: number;
  submittedAt: Date;
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
}

@Injectable()
export class PdfGeneratorService {
  private readonly primaryColor = '#1a365d'; // Dark blue
  private readonly secondaryColor = '#2d3748'; // Dark gray
  private readonly accentColor = '#3182ce'; // Blue
  private readonly lightGray = '#e2e8f0';

  async generateSubmissionPdf(data: SubmissionPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          info: {
            Title: `Estimate ${data.submissionNumber}`,
            Author: 'BBurn Builders',
            Subject: `Bathroom Renovation Estimate for ${data.clientName}`,
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Generate the PDF content
        this.addHeader(doc, data);
        this.addClientInfo(doc, data);
        this.addProjectSummary(doc, data);
        this.addLineItems(doc, data);
        this.addTotals(doc, data);
        this.addFooter(doc, data);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument, data: SubmissionPdfData): void {
    // Company Logo/Name
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text('BBurn Builders', 50, 50);

    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor(this.secondaryColor)
      .text('Professional Bathroom Renovation', 50, 82);

    // Estimate Number and Date (right aligned)
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(this.secondaryColor)
      .text(`Estimate #: ${data.submissionNumber}`, 400, 50, { align: 'right' })
      .text(`Date: ${this.formatDate(data.submittedAt)}`, 400, 65, {
        align: 'right',
      });

    // Horizontal line
    doc
      .moveTo(50, 110)
      .lineTo(562, 110)
      .strokeColor(this.lightGray)
      .lineWidth(2)
      .stroke();

    doc.moveDown(2);
  }

  private addClientInfo(
    doc: PDFKit.PDFDocument,
    data: SubmissionPdfData,
  ): void {
    const startY = 130;

    // Client Information Section
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text('CLIENT INFORMATION', 50, startY);

    doc.fontSize(10).font('Helvetica').fillColor(this.secondaryColor);

    const clientInfoY = startY + 25;
    doc.text(`Name: ${data.clientName}`, 50, clientInfoY);
    doc.text(`Email: ${data.clientEmail}`, 50, clientInfoY + 15);
    doc.text(`Phone: ${data.clientPhone}`, 50, clientInfoY + 30);

    // Project Address (right side)
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text('PROJECT ADDRESS', 300, startY);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(this.secondaryColor)
      .text(data.projectAddress, 300, clientInfoY, { width: 250 });

    if (data.zipCode) {
      doc.text(`Zip Code: ${data.zipCode}`, 300, clientInfoY + 30);
    }

    // Horizontal line
    doc
      .moveTo(50, clientInfoY + 60)
      .lineTo(562, clientInfoY + 60)
      .strokeColor(this.lightGray)
      .lineWidth(1)
      .stroke();
  }

  private addProjectSummary(
    doc: PDFKit.PDFDocument,
    data: SubmissionPdfData,
  ): void {
    const startY = 230;

    // Project Summary Box
    doc.rect(50, startY, 512, 50).fillColor('#f7fafc').fill();

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text('PROJECT TYPE', 60, startY + 10);

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(this.accentColor)
      .text(`${data.service.name} Bathroom Renovation`, 60, startY + 28);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(this.secondaryColor)
      .text(`Code: ${data.service.code}`, 450, startY + 20, {
        align: 'right',
      });
  }

  private addLineItems(doc: PDFKit.PDFDocument, data: SubmissionPdfData): void {
    const startY = 300;
    let currentY = startY;

    // Section Title
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text('SCOPE OF WORK', 50, currentY);

    currentY += 25;

    // Table Header
    doc.rect(50, currentY, 512, 25).fillColor(this.primaryColor).fill();

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('Description', 55, currentY + 8)
      .text('Qty', 350, currentY + 8)
      .text('Unit Price', 400, currentY + 8)
      .text('Total', 480, currentY + 8);

    currentY += 25;

    // Filter enabled items only
    const enabledItems = data.items.filter((item) => item.isEnabled);

    // Table Rows
    doc.font('Helvetica').fillColor(this.secondaryColor);

    for (let i = 0; i < enabledItems.length; i++) {
      const item = enabledItems[i];

      // Check if we need a new page
      if (currentY > 680) {
        doc.addPage();
        currentY = 50;
      }

      // Alternating row background
      if (i % 2 === 0) {
        doc.rect(50, currentY, 512, 25).fillColor('#f7fafc').fill();
      }

      doc.fillColor(this.secondaryColor);

      // Item name (with option if selected)
      let itemText = item.itemName || 'Item';
      if (item.selectedOptionName) {
        itemText += ` (${item.selectedOptionName})`;
      }

      doc
        .fontSize(9)
        .text(itemText, 55, currentY + 8, { width: 280, lineBreak: false })
        .text(item.quantity.toString(), 350, currentY + 8)
        .text(this.formatCurrency(item.unitPrice), 400, currentY + 8)
        .text(this.formatCurrency(item.totalPrice), 480, currentY + 8);

      currentY += 25;
    }

    // Store the current Y position for totals
    (doc as any).lastItemY = currentY;
  }

  private addTotals(doc: PDFKit.PDFDocument, data: SubmissionPdfData): void {
    let currentY = (doc as any).lastItemY || 500;

    // Check if we need a new page
    if (currentY > 650) {
      doc.addPage();
      currentY = 50;
    }

    currentY += 20;

    // Totals Section
    const totalsX = 350;

    // Horizontal line above totals
    doc
      .moveTo(totalsX, currentY)
      .lineTo(562, currentY)
      .strokeColor(this.lightGray)
      .lineWidth(1)
      .stroke();

    currentY += 15;

    // Base Price
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(this.secondaryColor)
      .text('Base Price:', totalsX, currentY)
      .text(this.formatCurrency(data.basePrice), 480, currentY);

    currentY += 20;

    // Additional Items
    doc
      .text('Additional Items:', totalsX, currentY)
      .text(this.formatCurrency(data.additionalItemsTotal), 480, currentY);

    currentY += 20;

    // Horizontal line
    doc
      .moveTo(totalsX, currentY)
      .lineTo(562, currentY)
      .strokeColor(this.primaryColor)
      .lineWidth(2)
      .stroke();

    currentY += 15;

    // Total Amount
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text('TOTAL ESTIMATE:', totalsX, currentY)
      .text(this.formatCurrency(data.totalAmount), 460, currentY);

    // Project Notes (if any)
    if (data.projectNotes) {
      currentY += 50;

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(this.primaryColor)
        .text('PROJECT NOTES', 50, currentY);

      currentY += 20;

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(this.secondaryColor)
        .text(data.projectNotes, 50, currentY, { width: 512 });
    }
  }

  private addFooter(doc: PDFKit.PDFDocument, data: SubmissionPdfData): void {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 80;

    // Footer line
    doc
      .moveTo(50, footerY)
      .lineTo(562, footerY)
      .strokeColor(this.lightGray)
      .lineWidth(1)
      .stroke();

    // Disclaimer
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#718096')
      .text(
        'This estimate is valid for 30 days from the date of issue. Prices are subject to change based on final site inspection. ' +
          'Additional costs may apply for unforeseen conditions. This is an estimate only and not a binding contract.',
        50,
        footerY + 15,
        { width: 512, align: 'center' },
      );

    // Company contact
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text(
        'BBurn Builders | info@bburnbuilders.com | (312) 555-1234',
        50,
        footerY + 45,
        {
          width: 512,
          align: 'center',
        },
      );
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  }
}
