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

  it('reordena widgets de um dashboard em memoria', async () => {
    const supabaseService = {
      isEnabled: () => false,
      getClient: () => ({ from: jest.fn() }),
    };

    const service = new DashboardsService(supabaseService as never);

    const dashboard = await service.createForUser('user-1', {
      name: 'Teste',
      description: 'Desc',
    });

    const w1 = await service.addWidget('user-1', dashboard.id, {
      widgetType: 'kpi',
      title: 'W1',
      displayOrder: 10,
    });
    const w2 = await service.addWidget('user-1', dashboard.id, {
      widgetType: 'kpi',
      title: 'W2',
      displayOrder: 20,
    });
    const w3 = await service.addWidget('user-1', dashboard.id, {
      widgetType: 'kpi',
      title: 'W3',
      displayOrder: 30,
    });

    const reordered = await service.reorderWidgets('user-1', dashboard.id, [
      { widgetId: w3.id, displayOrder: 10 },
      { widgetId: w1.id, displayOrder: 20 },
      { widgetId: w2.id, displayOrder: 30 },
    ]);

    const ids = reordered.widgets.map((w) => w.id);
    expect(ids).toEqual([w3.id, w1.id, w2.id]);
    expect(reordered.widgets[0]!.displayOrder).toBe(10);
    expect(reordered.widgets[1]!.displayOrder).toBe(20);
    expect(reordered.widgets[2]!.displayOrder).toBe(30);
  });
});
