import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NotificationsList } from './notifications-list';
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/lib/platform-api';

jest.mock('@/lib/platform-api', () => ({
  fetchNotifications: jest.fn(),
  markNotificationAsRead: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
}));

describe('NotificationsList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renderiza notificacoes carregadas pela API e marca uma como lida', async () => {
    (fetchNotifications as jest.Mock).mockResolvedValue([
      {
        id: 'n1',
        notification_type: 'alert',
        title: 'Alerta operacional',
        message: 'Verifique a fila.',
        related_resource_id: null,
        is_read: false,
        read_at: null,
        created_at: '2026-06-07T12:00:00.000Z',
      },
    ]);
    (markNotificationAsRead as jest.Mock).mockResolvedValue({
      id: 'n1',
      notification_type: 'alert',
      title: 'Alerta operacional',
      message: 'Verifique a fila.',
      related_resource_id: null,
      is_read: true,
      read_at: '2026-06-07T12:05:00.000Z',
      created_at: '2026-06-07T12:00:00.000Z',
    });

    render(<NotificationsList />);

    expect(await screen.findByText('Alerta operacional')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Marcar como lida' }));

    await waitFor(() => expect(markNotificationAsRead).toHaveBeenCalledWith('n1'));
  });

  it('renderiza erro quando a API falha', async () => {
    (fetchNotifications as jest.Mock).mockRejectedValue(new Error('falha'));

    render(<NotificationsList />);

    expect(
      await screen.findByText('Não foi possível carregar as notificações.'),
    ).toBeInTheDocument();
  });

  it('marca todas como lidas pela API', async () => {
    (fetchNotifications as jest.Mock).mockResolvedValue([
      {
        id: 'n1',
        notification_type: 'alert',
        title: 'Alerta operacional',
        message: 'Verifique a fila.',
        related_resource_id: null,
        is_read: false,
        read_at: null,
        created_at: '2026-06-07T12:00:00.000Z',
      },
      {
        id: 'n2',
        notification_type: 'export_ready',
        title: 'Exportação pronta',
        message: 'Baixe o arquivo.',
        related_resource_id: null,
        is_read: false,
        read_at: null,
        created_at: '2026-06-07T12:01:00.000Z',
      },
    ]);
    (markAllNotificationsAsRead as jest.Mock).mockResolvedValue({ updated: 2 });

    render(<NotificationsList />);

    await screen.findAllByText('Exportação pronta');
    await userEvent.click(screen.getByRole('button', { name: /marcar todas como lidas/i }));

    await waitFor(() => expect(markAllNotificationsAsRead).toHaveBeenCalled());
  });
});
