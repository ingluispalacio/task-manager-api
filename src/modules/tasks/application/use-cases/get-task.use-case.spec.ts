import { GetTaskUseCase } from './get-task.use-case';
import { TaskRepository } from '../../domain/task.repository';
import { DomainException } from '@/common/exceptions/domain.exception';

describe('GetTaskUseCase', () => {
  it('rejects access to a task that does not belong to the user', async () => {
    const taskRepository: TaskRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn().mockResolvedValue({ id: '1', userId: 'other-user', title: 'Other task', description: null, completed: false, dueDate: null, createdAt: new Date(), updatedAt: new Date() }),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const useCase = new GetTaskUseCase(taskRepository);

    await expect(useCase.execute('user-1', '1')).rejects.toThrow(DomainException);
  });
});
