import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  it('atualiza uma configuracao e registra auditoria', async () => {
    const select = jest.fn().mockReturnThis();
    const order = jest.fn();
    const eq = jest.fn().mockResolvedValue({
      data: {
        id: 's1',
        setting_key: 'smtp.host',
        setting_value: { value: 'smtp.new.example.com' },
        description: 'Servidor SMTP',
        is_sensitive: false,
        updated_at: '2026-06-07T12:00:00.000Z',
      },
      error: null,
    });
    const update = jest.fn().mockReturnValue({ eq, select });
    const from = jest.fn().mockReturnValue({ select, order, update });
    const supabaseService = {
      isEnabled: () => true,
      getClient: () => ({ from }),
    };
    const auditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const service = new SettingsService(supabaseService as never, auditService as never);

    const updated = await service.updateSetting(
      {
        userId: 'user-1',
        userEmail: 'admin@example.com',
      },
      'smtp.host',
      { value: 'smtp.new.example.com' },
    );

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        setting_value: { value: 'smtp.new.example.com' },
      }),
    );
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        userEmail: 'admin@example.com',
        action: 'settings.updated',
        resource: 'system_settings',
        resourceId: 'smtp.host',
      }),
    );
    expect(updated.setting_key).toBe('smtp.host');
  });
});
