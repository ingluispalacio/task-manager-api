import { Inject, Injectable } from '@nestjs/common';
import { TASK_REPOSITORY, TaskRepository } from '../../domain/task.repository';
import { Task } from '../../domain/task.model';
import { DomainException } from '@/common/exceptions/domain.exception';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class CreateTaskUseCase {  
  private readonly MODULE = 'tasks';
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
    @InjectPinoLogger(CreateTaskUseCase.name)
    private readonly logger?: PinoLogger,
  ) {
    if (this.logger) this.logger.setContext(CreateTaskUseCase.name);
  }

  async execute(userId: string, title: string, description?: string, dueDate?: string): Promise<Task> {
    this.logger?.info({ module: this.MODULE, msg: 'Creating task', userId, title });

    if (!title || title.trim().length < 3) {
      this.logger?.warn({ module: this.MODULE, msg: 'Invalid title', title });
      throw new DomainException('Title must be at least 3 characters', 400);
    }

    const task = new Task(
      crypto.randomUUID(),
      userId,
      title.trim(),
      description ?? null,
      false,
      dueDate ? new Date(dueDate) : null,
      new Date(),
      new Date(),
    );

    const created = await this.taskRepository.create(task);
    this.logger?.info({ module: this.MODULE, msg: 'Task created', taskId: created.id, userId });
    return created;
  }
}
