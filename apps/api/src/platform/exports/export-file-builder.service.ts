import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Buffer } from 'node:buffer';

import { ExportJobPayload } from './exports.queue';

type ExportFormat = ExportJobPayload['exportFormat'];
type ExportRow = Record<string, unknown>;

export type BuildExportFileInput = {
  format: ExportFormat;
  reportId?: string;
  reportName: string;
  requestedBy: string;
  generatedAt: string;
  parameters?: Record<string, unknown>;
  rows: ExportRow[];
};

export type BuiltExportFile = {
  buffer: Buffer;
  extension: 'pdf' | 'xlsx' | 'csv' | 'json';
  mimeType: string;
};

@Injectable()
export class ExportFileBuilderService {
  async build(input: BuildExportFileInput): Promise<BuiltExportFile> {
    switch (input.format) {
      case 'pdf':
        return {
          buffer: await this.buildPdfBuffer(input),
          extension: 'pdf',
          mimeType: 'application/pdf',
        };
      case 'excel':
        return {
          buffer: await this.buildExcelBuffer(input),
          extension: 'xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
      case 'csv':
        return {
          buffer: Buffer.from(this.buildCsvContent(input.rows), 'utf8'),
          extension: 'csv',
          mimeType: 'text/csv; charset=utf-8',
        };
      case 'json':
        return {
          buffer: Buffer.from(JSON.stringify(this.buildJsonPayload(input), null, 2), 'utf8'),
          extension: 'json',
          mimeType: 'application/json; charset=utf-8',
        };
    }
  }

  private async buildPdfBuffer(input: BuildExportFileInput): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const document = new PDFDocument({
        margin: 48,
        info: {
          Title: `Exportação ${input.reportName}`,
          Author: 'Dashboard Power BI',
        },
      });

      document.on('data', (chunk: Buffer | Uint8Array) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);

      document.fontSize(18).text(input.reportName);
      document.moveDown(0.5);
      document
        .fontSize(10)
        .fillColor('#475569')
        .text(`Relatório: ${input.reportId ?? 'N/A'}`);
      document.text(`Solicitado por: ${input.requestedBy}`);
      document.text(`Gerado em: ${new Date(input.generatedAt).toLocaleString('pt-BR')}`);

      if (input.parameters && Object.keys(input.parameters).length > 0) {
        document.moveDown();
        document.fillColor('#0f172a').fontSize(12).text('Parâmetros');
        Object.entries(input.parameters).forEach(([key, value]) => {
          document.fontSize(10).text(`${key}: ${this.stringifyCell(value)}`);
        });
      }

      document.moveDown();
      document.fillColor('#0f172a').fontSize(12).text('Dados');

      if (input.rows.length === 0) {
        document.fontSize(10).text('Nenhum dado encontrado para os filtros informados.');
        document.end();
        return;
      }

      const headers = Object.keys(input.rows[0]!);
      document.fontSize(10).text(headers.join(' | '));
      document.moveDown(0.3);

      input.rows.forEach((row) => {
        const line = headers.map((header) => this.stringifyCell(row[header])).join(' | ');
        document.fontSize(9).text(line);
      });

      document.end();
    });
  }

  private async buildExcelBuffer(input: BuildExportFileInput): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const metadataSheet = workbook.addWorksheet('Resumo');
    const dataSheet = workbook.addWorksheet('Dados');
    const headers = input.rows.length > 0 ? Object.keys(input.rows[0]!) : [];

    metadataSheet.addRows([
      ['Relatório', input.reportName],
      ['ID', input.reportId ?? 'N/A'],
      ['Solicitado por', input.requestedBy],
      ['Gerado em', input.generatedAt],
      ['Parâmetros', JSON.stringify(input.parameters ?? {})],
    ]);

    if (headers.length > 0) {
      dataSheet.addRow(headers);
      input.rows.forEach((row) => {
        dataSheet.addRow(headers.map((header) => row[header] ?? ''));
      });
      dataSheet.getRow(1).font = { bold: true };
    } else {
      dataSheet.addRow(['message']);
      dataSheet.addRow(['Nenhum dado encontrado para os filtros informados.']);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private buildCsvContent(rows: ExportRow[]): string {
    if (rows.length === 0) {
      return 'message\nNenhum dado encontrado para os filtros informados.';
    }

    const headers = Object.keys(rows[0]!);
    const body = rows
      .map((row) => headers.map((header) => escapeCsvValue(row[header])).join(','))
      .join('\n');

    return `${headers.join(',')}\n${body}`;
  }

  private buildJsonPayload(input: BuildExportFileInput) {
    return {
      reportId: input.reportId ?? null,
      reportName: input.reportName,
      requestedBy: input.requestedBy,
      generatedAt: input.generatedAt,
      parameters: input.parameters ?? {},
      rows: input.rows,
    };
  }

  private stringifyCell(value: unknown): string {
    if (value === null || value === undefined) {
      return '-';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }
}

function escapeCsvValue(value: unknown): string {
  const normalized = value === null || value === undefined ? '' : String(value);

  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}
