import { Inject, Injectable } from '@nestjs/common';
import { TASK_REPOSITORY, TaskRepository } from '../../domain/task.repository';
import { Task } from '../../domain/task.model';
import { DomainException } from '@/common/exceptions/domain.exception';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class UpdateTaskUseCase {
  private readonly MODULE = 'tasks';
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
    @InjectPinoLogger(UpdateTaskUseCase.name)
    private readonly logger?: PinoLogger,
  ) {
    if (this.logger) this.logger.setContext(UpdateTaskUseCase.name);
  }

  async execute(userId: string, taskId: string, payload: { title?: string; description?: string | null; completed?: boolean; dueDate?: string | Date | null }): Promise<Task> {
    this.logger?.info({ module: this.MODULE, msg: 'Updating task', userId, taskId, payload });
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask || existingTask.userId !== userId) {
      this.logger?.warn({ module: this.MODULE, msg: 'Task not found for update', userId, taskId });
      throw new DomainException('Task not found', 404);
    }

    const dueDate = typeof payload.dueDate === 'string'
      ? (payload.dueDate ? new Date(payload.dueDate) : null)
      : payload.dueDate ?? existingTask.dueDate;

    const updatedTask = new Task(
      existingTask.id,
      existingTask.userId,
      payload.title?.trim() ?? existingTask.title,
      payload.description ?? existingTask.description,
      payload.completed ?? existingTask.completed,
      dueDate,
      existingTask.createdAt,
      new Date(),
    );

    const saved = await this.taskRepository.update(updatedTask);
    this.logger?.info({ msg: 'Task updated', taskId: saved.id, userId });
    return saved;
  }
}
