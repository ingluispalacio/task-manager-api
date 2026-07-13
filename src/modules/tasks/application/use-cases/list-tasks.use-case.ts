import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { TASK_REPOSITORY, TaskRepository } from '../../domain/task.repository';
import { Task } from '../../domain/task.model';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class ListTasksUseCase {
  private readonly MODULE = 'tasks';
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
    @InjectPinoLogger(ListTasksUseCase.name)
    private readonly logger?: PinoLogger,
  ) {
    if (this.logger) this.logger.setContext(ListTasksUseCase.name);
  }

  async execute(userId: string, page: number, limit: number): Promise<Task[]> {
    this.logger?.info({ module: this.MODULE, msg: 'Listing tasks', userId, page, limit });
    if (page<1) {
      this.logger?.warn({ module: this.MODULE, msg: 'Invalid page', page });
      throw new BadRequestException('The page number cannot be less than 1');
    }
    const tasks = await this.taskRepository.findByUserId(userId, page, limit);
    this.logger?.info({ module: this.MODULE, msg: 'Tasks listed', userId, count: tasks.length });
    return tasks;
  }
}
