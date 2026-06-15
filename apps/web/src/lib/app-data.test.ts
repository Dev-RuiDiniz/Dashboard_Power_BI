import {
  createAppDataClient,
  demoExportJobs,
  demoKpis,
  demoNotifications,
  demoSystemSettings,
} from './app-data';

describe('app-data demo client', () => {
  it('deve usar dados mockados quando NEXT_PUBLIC_USE_MOCK_DATA=true', async () => {
    const client = createAppDataClient({
      useMockData: true,
    });

    await expect(client.listKpis()).resolves.toEqual(demoKpis);
    await expect(client.listExportJobs()).resolves.toEqual(demoExportJobs);
    await expect(client.listNotifications()).resolves.toEqual(demoNotifications);
    await expect(client.listSystemSettings()).resolves.toEqual(demoSystemSettings);
  });

  it('deve permitir marcar notificacao isolada e em lote no client demo', async () => {
    const client = createAppDataClient({
      useMockData: true,
    });

    await client.markNotificationAsRead('notif-1');
    let notifications = await client.listNotifications();

    expect(notifications.find((item) => item.id === 'notif-1')?.is_read).toBe(true);

    await client.markAllNotificationsAsRead(['notif-2', 'notif-3']);
    notifications = await client.listNotifications();

    expect(notifications.filter((item) => !item.is_read)).toHaveLength(0);
  });
});
