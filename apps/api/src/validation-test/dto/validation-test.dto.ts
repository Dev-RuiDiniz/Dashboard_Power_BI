import { IsString, MinLength } from 'class-validator';

export class ValidationTestDto {
  @IsString()
  @MinLength(3)
  name!: string;
}
