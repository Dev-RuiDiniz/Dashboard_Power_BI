import { HealthService } from './health.service';

describe('HealthService', () => {
  it('deve retornar o status da API', () => {
    const service = new HealthService();

    expect(service.getHealth()).toEqual({
      status: 'ok',
      service: 'dashboard-power-bi-api',
    });
  });
});
