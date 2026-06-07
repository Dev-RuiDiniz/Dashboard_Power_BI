import { ExportJobRunnerService } from './export-job-runner.service';

describe('ExportJobRunnerService', () => {
  it('busca todas as páginas do relatório e monta o arquivo final', async () => {
    const reportsApiService = {
      getReportById: jest.fn().mockResolvedValue({
        id: 'report-1',
        name: 'Relatório Financeiro',
      }),
      queryReport: jest
        .fn()
        .mockResolvedValueOnce({
          items: [{ metric: 'Receita', value: 120000 }],
          page: 1,
          pageSize: 100,
          total: 2,
          totalPages: 2,
        })
        .mockResolvedValueOnce({
          items: [{ metric: 'Margem', value: 0.32 }],
          page: 2,
          pageSize: 100,
          total: 2,
          totalPages: 2,
        }),
    };
    const exportFileBuilderService = {
      build: jest.fn().mockResolvedValue({
        buffer: Buffer.from('%PDF-test'),
        extension: 'pdf',
        mimeType: 'application/pdf',
      }),
    };

    const service = new ExportJobRunnerService(
      reportsApiService as never,
      exportFileBuilderService as never,
    );

    const result = await service.run({
      jobId: 'job-1',
      userId: 'user-1',
      reportId: 'report-1',
      exportFormat: 'pdf',
      parameters: { ano: 2026 },
      requestContext: {
        userId: 'user-1',
        email: 'admin@example.com',
        roles: ['admin'],
        sectors: ['financeiro'],
        permissions: [],
      },
    });

    expect(reportsApiService.getReportById).toHaveBeenCalledWith(
      'report-1',
      expect.objectContaining({ sub: 'user-1', email: 'admin@example.com' }),
    );
    expect(reportsApiService.queryReport).toHaveBeenCalledTimes(2);
    expect(exportFileBuilderService.build).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'pdf',
        reportId: 'report-1',
        reportName: 'Relatório Financeiro',
        requestedBy: 'admin@example.com',
        rows: [
          { metric: 'Receita', value: 120000 },
          { metric: 'Margem', value: 0.32 },
        ],
      }),
    );
    expect(result.extension).toBe('pdf');
  });
});
