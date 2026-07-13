import { CreateTaskUseCase } from './create-task.use-case';
import { TaskRepository } from '../../domain/task.repository';
import { DomainException } from '@/common/exceptions/domain.exception';

describe('CreateTaskUseCase', () => {
  it('creates a task successfully', async () => {
    const taskRepository: TaskRepository = {
      create: jest.fn().mockResolvedValue({ id: '1', userId: 'user-1', title: 'Test task', description: null, completed: false, dueDate: null, createdAt: new Date(), updatedAt: new Date() }),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const useCase = new CreateTaskUseCase(taskRepository);
    const result = await useCase.execute('user-1', 'Test task');

    expect(result.title).toBe('Test task');
    expect(result.completed).toBe(false);
  });

  it('rejects invalid task title', async () => {
    const taskRepository: TaskRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const useCase = new CreateTaskUseCase(taskRepository);

    await expect(useCase.execute('user-1', '  ')).rejects.toThrow(DomainException);
  });
});
