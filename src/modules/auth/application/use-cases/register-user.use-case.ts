import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@/common/exceptions/domain.exception';
import { User } from '../../domain/user.model';
import { USER_REPOSITORY, UserRepository } from '../../domain/user.repository';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

async function hashPassword(password: string): Promise<string> {
  try {
    const bcrypt = await import('bcrypt');
    return bcrypt.hash(password, 10);
  } catch {
    const bcryptjs = await import('bcryptjs');
    return bcryptjs.hash(password, 10);
  }
}

@Injectable()
export class RegisterUserUseCase {
  private readonly MODULE = 'auth';
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @InjectPinoLogger(RegisterUserUseCase.name)
    private readonly logger?: PinoLogger,
  ) {
    if (this.logger) this.logger.setContext(RegisterUserUseCase.name);
  }

  async execute(email: string, password: string): Promise<{ id: string; email: string }> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) { 
      this.logger?.info({ module: this.MODULE, msg: 'Email already registered', userId: existingUser.id, email: existingUser.email });
      throw new DomainException('Email already registered', 409);
    }

    const hashedPassword = await hashPassword(password);
    const user = await this.userRepository.create(
      new User(
        crypto.randomUUID(),
        email,
        hashedPassword,
        new Date(),
        new Date(),
      ),
    );

    this.logger?.info({ module: this.MODULE, msg: 'User registered', userId: user.id, email: user.email });

    return { id: user.id, email: user.email };
  }
}
