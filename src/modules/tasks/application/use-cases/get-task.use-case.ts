import { Inject, Injectable } from '@nestjs/common';
import { TASK_REPOSITORY, TaskRepository } from '../../domain/task.repository';
import { Task } from '../../domain/task.model';
import { DomainException } from '@/common/exceptions/domain.exception';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class GetTaskUseCase {
  private readonly MODULE = 'tasks';
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
    @InjectPinoLogger(GetTaskUseCase.name)
    private readonly logger?: PinoLogger,
  ) {
    if (this.logger) this.logger.setContext(GetTaskUseCase.name);
  }

  async execute(userId: string, taskId: string): Promise<Task> {
    this.logger?.info({ module: this.MODULE, msg: 'Fetching task', userId, taskId });
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.userId !== userId) {
      this.logger?.warn({ module: this.MODULE, msg: 'Task not found', userId, taskId });
      throw new DomainException('Task not found', 404);
    }

    this.logger?.info({ module: this.MODULE, msg: 'Task retrieved', taskId, userId });
    return task;
  }
}
