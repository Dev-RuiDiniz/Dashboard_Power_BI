import { ConfigService } from '@nestjs/config';

import { GroupsRepository } from './groups.repository';

describe('GroupsRepository demo seeds', () => {
  it('deve popular grupos padrao no modo demo', async () => {
    const repository = new GroupsRepository(
      new ConfigService({
        APP_MODE: 'demo',
      }),
    );

    const groups = await repository.findAll();

    expect(groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Administradores', roles: ['admin'] }),
        expect.objectContaining({ name: 'Financeiro Viewer', sectors: ['financeiro'] }),
        expect.objectContaining({ name: 'Comercial Viewer', sectors: ['comercial'] }),
      ]),
    );
  });
});
