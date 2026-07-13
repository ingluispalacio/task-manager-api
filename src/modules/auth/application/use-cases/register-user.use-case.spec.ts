import { RegisterUserUseCase } from './register-user.use-case';
import { UserRepository } from '../../domain/user.repository';
import { DomainException } from '@/common/exceptions/domain.exception';

describe('RegisterUserUseCase', () => {
  it('rejects a duplicate email', async () => {
    const userRepository: UserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue({ id: '1', email: 'test@example.com', password: 'hash', createdAt: new Date(), updatedAt: new Date() }),
      findById: jest.fn(),
    };

    const useCase = new RegisterUserUseCase(userRepository);

    await expect(useCase.execute('test@example.com', 'password123')).rejects.toThrow(DomainException);
  });
});
