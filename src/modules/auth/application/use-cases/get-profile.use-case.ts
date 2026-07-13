import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../domain/user.repository';
import { DomainException } from '@/common/exceptions/domain.exception';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class GetProfileUseCase {
  private readonly MODULE = 'auth';
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @InjectPinoLogger(GetProfileUseCase.name)
    private readonly logger?: PinoLogger,
  ) {
    if (this.logger) this.logger.setContext(GetProfileUseCase.name);
  }

  async execute(userId: string): Promise<{ id: string; email: string }> {
    this.logger?.info({ module: this.MODULE, msg: 'Fetching profile', userId });
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger?.warn({ module: this.MODULE, msg: 'User not found', userId });
      throw new DomainException('User not found', 404);
    }

    this.logger?.info({ module: this.MODULE, msg: 'Profile retrieved', userId: user.id, email: user.email });
    return { id: user.id, email: user.email };
  }
}
