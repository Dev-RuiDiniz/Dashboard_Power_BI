import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TwoFactorGuard } from '../../auth/guards/two-factor.guard';
import { AuthenticatedRequestUser } from '../../auth/types/auth.types';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard, TwoFactorGuard)
@Roles('admin')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOkResponse({ description: 'Lista configuracoes do sistema.' })
  list() {
    return this.settingsService.listSettings();
  }

  @Patch(':key')
  @ApiOkResponse({ description: 'Atualiza uma configuracao do sistema.' })
  update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
  ) {
    return this.settingsService.updateSetting(
      {
        userId: user.sub,
        userEmail: user.email,
      },
      key,
      dto.value,
    );
  }
}
