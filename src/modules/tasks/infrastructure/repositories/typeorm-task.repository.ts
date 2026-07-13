import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { TaskRepository } from '../../domain/task.repository';
import { Task } from '../../domain/task.model';
import { TaskEntity } from '../entities/task.entity';

@Injectable()
export class TypeOrmTaskRepository implements TaskRepository {
  constructor(@InjectRepository(TaskEntity) private readonly repository: Repository<TaskEntity>) {}

  async create(task: Task): Promise<Task> {
    const entity = this.repository.create({
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description,
      completed: task.completed,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
    const saved = await this.repository.save(entity);
    return new Task(saved.id, saved.userId, saved.title, saved.description, saved.completed, saved.dueDate, saved.createdAt, saved.updatedAt);
  }

  async findByUserId(userId: string, page: number, limit: number): Promise<Task[]> {
    const entities = await this.repository.find({
      where: { userId},
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return entities.map((entity) => new Task(entity.id, entity.userId, entity.title, entity.description, entity.completed, entity.dueDate, entity.createdAt, entity.updatedAt));
  }

  async findById(id: string): Promise<Task | null> {
    const entity = await this.repository.findOne({ where: { id} });
    return entity ? new Task(entity.id, entity.userId, entity.title, entity.description, entity.completed, entity.dueDate, entity.createdAt, entity.updatedAt) : null;
  }

  async update(task: Task): Promise<Task> {
    const entity = await this.repository.preload({
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description,
      completed: task.completed,
      dueDate: task.dueDate,
      updatedAt: task.updatedAt,
    });
    if (!entity) {
      throw new Error('Task not found for update');
    }
    const saved = await this.repository.save(entity);
    return new Task(saved.id, saved.userId, saved.title, saved.description, saved.completed, saved.dueDate, saved.createdAt, saved.updatedAt);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
