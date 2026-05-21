import { Module } from '@nestjs/common';

import { ValidationTestController } from './validation-test.controller';

@Module({
  controllers: [ValidationTestController],
})
export class ValidationTestModule {}
