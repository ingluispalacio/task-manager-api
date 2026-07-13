import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CreateTaskDto } from '../application/dto/create-task.dto';
import { UpdateTaskDto } from '../application/dto/update-task.dto';
import { TaskResponseDto } from '../application/dto/task-response.dto';
import { CreateTaskUseCase } from '../application/use-cases/create-task.use-case';
import { ListTasksUseCase } from '../application/use-cases/list-tasks.use-case';
import { GetTaskUseCase } from '../application/use-cases/get-task.use-case';
import { UpdateTaskUseCase } from '../application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '../application/use-cases/delete-task.use-case';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TasksController {
  private readonly MODULE = 'tasks';
  constructor(
    @InjectPinoLogger(TasksController.name)
    private readonly logger: PinoLogger,
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
  ) {
    this.logger.setContext(TasksController.name);
  }

  @Post()
  async create(@Req() req: { user: { userId: string } }, @Body() dto: CreateTaskDto): Promise<TaskResponseDto> {
    this.logger.info({ module: this.MODULE, msg: 'Create task request', userId: req.user.userId, title: dto.title });
    const task = await this.createTaskUseCase.execute(req.user.userId, dto.title, dto.description, dto.dueDate);
    this.logger.info({ module: this.MODULE, msg: 'Create task succeeded', taskId: task.id, userId: req.user.userId });
    return this.toResponse(task);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Req() req: { user: { userId: string } }, @Query('page') page = 1, @Query('limit') limit = 10): Promise<TaskResponseDto[]> {
    this.logger.info({ module: this.MODULE, msg: 'List tasks request', userId: req.user.userId, page, limit });
    const tasks = await this.listTasksUseCase.execute(req.user.userId, Number(page), Number(limit));
    this.logger.info({ module: this.MODULE, msg: 'List tasks succeeded', userId: req.user.userId, count: tasks.length });
    return tasks.map((task) => this.toResponse(task));
  }

  @Get(':id')
  async findOne(@Req() req: { user: { userId: string } }, @Param('id') id: string): Promise<TaskResponseDto> {
    this.logger.info({ module: this.MODULE, msg: 'Get task request', userId: req.user.userId, taskId: id });
    const task = await this.getTaskUseCase.execute(req.user.userId, id);
    this.logger.info({ module: this.MODULE, msg: 'Get task succeeded', taskId: task.id, userId: req.user.userId });
    return this.toResponse(task);
  }

  @Put(':id')
  async update(@Req() req: { user: { userId: string } }, @Param('id') id: string, @Body() dto: UpdateTaskDto): Promise<TaskResponseDto> {
    this.logger.info({ module: this.MODULE, msg: 'Update task request', userId: req.user.userId, taskId: id, payload: dto });
    const task = await this.updateTaskUseCase.execute(req.user.userId, id, dto);
    this.logger.info({ module: this.MODULE, msg: 'Update task succeeded', taskId: task.id, userId: req.user.userId });
    return this.toResponse(task);
  }

  @Delete(':id')
  async remove(@Req() req: { user: { userId: string } }, @Param('id') id: string): Promise<void> {
    this.logger.info({ module: this.MODULE, msg: 'Delete task request', userId: req.user.userId, taskId: id });
    await this.deleteTaskUseCase.execute(req.user.userId, id);
    this.logger.info({ module: this.MODULE, msg: 'Delete task succeeded', taskId: id, userId: req.user.userId });
  }

  private toResponse(task: any): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : '',
      updatedAt: task.updatedAt ? new Date(task.updatedAt).toISOString() : '',
    };
  }
}
