import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'node:fs';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedRequestUser } from '../../auth/types/auth.types';
import { CreateExportDto } from './dto/create-export.dto';
import { ExportsService } from './exports.service';

@ApiTags('exports')
@ApiBearerAuth()
@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Lista exportações do usuário autenticado.' })
  list(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.exportsService.listForUser(user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ description: 'Cria um job de exportação.' })
  create(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreateExportDto) {
    return this.exportsService.createForUser(user, dto);
  }

  @Get('files/:fileName')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Download de arquivo exportado.' })
  async downloadFile(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('fileName') fileName: string,
    @Res() response: Response,
  ): Promise<void> {
    const filePath = await this.exportsService.getFilePathForUser(user.sub, fileName);
    response.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    createReadStream(filePath).pipe(response);
  }
}
