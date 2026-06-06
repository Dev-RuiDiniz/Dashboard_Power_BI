import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedRequestUser } from '../../auth/types/auth.types';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOkResponse({ description: 'Lista notificações do usuário autenticado.' })
  list(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.notificationsService.listForUser(user.sub);
  }

  @Patch('read-all')
  @ApiOkResponse({ description: 'Marca todas as notificações como lidas.' })
  markAllAsRead(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.notificationsService.markAllAsRead(user.sub);
  }

  @Patch(':id/read')
  @ApiOkResponse({ description: 'Marca uma notificação como lida.' })
  markAsRead(@CurrentUser() user: AuthenticatedRequestUser, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.sub, id);
  }
}
