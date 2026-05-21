import { Injectable } from '@nestjs/common';

export interface HealthResponse {
  status: 'ok';
  service: 'dashboard-power-bi-api';
}

@Injectable()
export class HealthService {
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'dashboard-power-bi-api',
    };
  }
}
