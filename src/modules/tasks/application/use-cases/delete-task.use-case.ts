import { Inject, Injectable } from '@nestjs/common';
import { TASK_REPOSITORY, TaskRepository } from '../../domain/task.repository';
import { DomainException } from '@/common/exceptions/domain.exception';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class DeleteTaskUseCase {
  private readonly MODULE = 'tasks';
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
    @InjectPinoLogger(DeleteTaskUseCase.name)
    private readonly logger?: PinoLogger,
  ) {
    if (this.logger) this.logger.setContext(DeleteTaskUseCase.name);
  }

  async execute(userId: string, taskId: string): Promise<void> {
    this.logger?.info({ module: this.MODULE, msg: 'Deleting task', userId, taskId });
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.userId !== userId) {
      this.logger?.warn({ module: this.MODULE, msg: 'Task not found for delete', userId, taskId });
      throw new DomainException('Task not found', 404);
    }

    await this.taskRepository.delete(taskId);
    this.logger?.info({ module: this.MODULE, msg: 'Task deleted', taskId, userId });
  }
}
