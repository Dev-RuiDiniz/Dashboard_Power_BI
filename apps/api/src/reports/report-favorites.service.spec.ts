import { ReportFavoritesService } from './report-favorites.service';

describe('ReportFavoritesService', () => {
  it('lista, favorita e desfavorita relatorios do usuario', async () => {
    const favoriteSelect = jest
      .fn()
      .mockResolvedValueOnce({
        data: [{ report_id: 'report-1' }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ report_id: 'report-1' }],
        error: null,
      });
    const insertFavorite = jest.fn().mockResolvedValue({ error: null });
    const deleteFavorite = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn(() => ({
      select: () => ({
        eq: jest.fn().mockReturnValue({
          order: favoriteSelect,
          delete: () => ({ eq: jest.fn().mockReturnValue({ eq: deleteFavorite }) }),
        }),
      }),
      insert: insertFavorite,
      delete: () => ({ eq: jest.fn().mockReturnValue({ eq: deleteFavorite }) }),
    }));

    const reportDefinitionsService = {
      list: jest.fn().mockResolvedValue([
        {
          id: 'report-1',
          name: 'Receita',
          description: 'Consolidado',
          sector: 'financeiro',
          sourceType: 'view',
          sourceName: 'vw_receita',
          parameters: [],
          requiredPermissions: [],
          isActive: true,
          createdAt: '2026-06-07T12:00:00.000Z',
          updatedAt: '2026-06-07T12:00:00.000Z',
        },
      ]),
      getById: jest.fn().mockResolvedValue({
        id: 'report-1',
        name: 'Receita',
        description: 'Consolidado',
        sector: 'financeiro',
        sourceType: 'view',
        sourceName: 'vw_receita',
        parameters: [],
        requiredPermissions: [],
        isActive: true,
        createdAt: '2026-06-07T12:00:00.000Z',
        updatedAt: '2026-06-07T12:00:00.000Z',
      }),
    };
    const supabaseService = {
      isEnabled: () => true,
      getClient: () => ({ from }),
    };

    const service = new ReportFavoritesService(
      supabaseService as never,
      reportDefinitionsService as never,
    );

    const favorites = await service.listForUser('user-1');
    await service.favorite('user-1', 'report-1');
    await service.unfavorite('user-1', 'report-1');

    expect(favorites).toHaveLength(1);
    expect(favorites[0]).toMatchObject({ id: 'report-1', name: 'Receita' });
    expect(insertFavorite).toHaveBeenCalled();
    expect(deleteFavorite).toHaveBeenCalled();
  });
});
