import { ApiProperty } from '@nestjs/swagger';

export class TaskResponseDto {
  @ApiProperty()
  id: string = '';

  @ApiProperty()
  title: string = '';

  @ApiProperty({ required: false, nullable: true })
  description: string | null = null;

  @ApiProperty()
  completed: boolean = false;

  @ApiProperty({ required: false, nullable: true })
  dueDate: string | null = null;

  @ApiProperty()
  createdAt: string = '';

  @ApiProperty()
  updatedAt: string = '';
}
