import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Study NestJS' })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title: string = '';

  @ApiProperty({ example: 'Review dependency injection', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-12-31T00:00:00.000Z', required: false })
  @IsOptional()
  dueDate?: string;
}
