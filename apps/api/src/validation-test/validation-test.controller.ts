import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { ValidationTestDto } from './dto/validation-test.dto';

@ApiTags('validation')
@Controller('validation-test')
export class ValidationTestController {
  @Post()
  @ApiBody({ type: ValidationTestDto })
  @ApiCreatedResponse({
    description: 'Endpoint técnico usado para validar o ValidationPipe global.',
    schema: {
      example: {
        accepted: true,
        name: 'teste',
      },
    },
  })
  validate(@Body() payload: ValidationTestDto): { accepted: true; name: string } {
    return {
      accepted: true,
      name: payload.name,
    };
  }
}
