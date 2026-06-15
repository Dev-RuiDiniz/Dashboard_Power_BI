import ExcelJS from 'exceljs';

import { ExportFileBuilderService } from './export-file-builder.service';

describe('ExportFileBuilderService', () => {
  const input = {
    reportId: 'report-1',
    reportName: 'Relatório Financeiro',
    requestedBy: 'user-1',
    generatedAt: '2026-06-07T15:00:00.000Z',
    parameters: {
      ano: 2026,
      setor: 'financeiro',
    },
    rows: [
      { metric: 'Receita', value: 120000 },
      { metric: 'Margem', value: 0.32 },
    ],
  };

  it('gera um PDF válido para download', async () => {
    const service = new ExportFileBuilderService();

    const file = await service.build({
      format: 'pdf',
      ...input,
    });

    expect(file.extension).toBe('pdf');
    expect(file.mimeType).toBe('application/pdf');
    expect(file.buffer.subarray(0, 5).toString('utf8')).toBe('%PDF-');
  });

  it('gera um arquivo XLSX válido com cabeçalhos e linhas', async () => {
    const service = new ExportFileBuilderService();

    const file = await service.build({
      format: 'excel',
      ...input,
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(
      Buffer.from(file.buffer) as unknown as Parameters<typeof workbook.xlsx.load>[0],
    );
    const worksheet = workbook.getWorksheet('Dados');

    expect(file.extension).toBe('xlsx');
    expect(file.mimeType).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(worksheet).toBeDefined();
    expect(worksheet?.getCell('A1').value).toBe('metric');
    expect(worksheet?.getCell('B1').value).toBe('value');
    expect(worksheet?.getCell('A2').value).toBe('Receita');
    expect(worksheet?.getCell('B2').value).toBe(120000);
    expect(worksheet?.getCell('A3').value).toBe('Margem');
    expect(worksheet?.getCell('B3').value).toBe(0.32);
  });
});
