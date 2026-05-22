import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignUserGroupsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  groupIds!: string[];
}
