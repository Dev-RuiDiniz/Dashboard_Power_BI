import { DashboardsService } from './dashboards.service';

describe('DashboardsService', () => {
  it('lista e cria dashboards do usuario com suporte a dashboard padrao', async () => {
    const listOrder = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'dashboard-1',
          user_id: 'user-1',
          name: 'Operacional',
          description: 'Visao do time',
          is_default: true,
          layout: { columns: 12 },
          created_at: '2026-06-07T12:00:00.000Z',
          updated_at: '2026-06-07T12:00:00.000Z',
        },
      ],
      error: null,
    });
    const widgetOrder = jest.fn().mockResolvedValue({ data: [], error: null });
    const createSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'dashboard-2',
        user_id: 'user-1',
        name: 'Comercial',
        description: 'Pipeline',
        is_default: true,
        layout: { columns: 12 },
        created_at: '2026-06-07T12:10:00.000Z',
        updated_at: '2026-06-07T12:10:00.000Z',
      },
      error: null,
    });
    const from = jest.fn((table: string) => {
      if (table === 'dashboards') {
        return {
          select: () => ({
            eq: () => ({
              order: listOrder,
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
          insert: jest.fn().mockReturnValue({
            select: () => ({
              single: createSingle,
            }),
          }),
        };
      }

      return {
        select: () => ({
          in: () => ({
            order: widgetOrder,
          }),
        }),
      };
    });
    const supabaseService = {
      isEnabled: () => true,
      getClient: () => ({ from }),
    };

    const service = new DashboardsService(supabaseService as never);

    const listed = await service.listForUser('user-1');
    const created = await service.createForUser('user-1', {
      name: 'Comercial',
      description: 'Pipeline',
      isDefault: true,
    });

    expect(listed[0]).toMatchObject({
      id: 'dashboard-1',
      isDefault: true,
      widgets: [],
    });
    expect(created).toMatchObject({
      id: 'dashboard-2',
      name: 'Comercial',
      isDefault: true,
    });
  });
});
