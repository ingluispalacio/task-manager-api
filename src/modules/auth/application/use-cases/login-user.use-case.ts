import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DomainException } from '@/common/exceptions/domain.exception';
import { USER_REPOSITORY, UserRepository } from '../../domain/user.repository';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, hash);
  } catch {
    const bcryptjs = await import('bcryptjs');
    return bcryptjs.compare(password, hash);
  }
}

@Injectable()
export class LoginUserUseCase {
  private readonly MODULE = 'auth';

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    @InjectPinoLogger(LoginUserUseCase.name)
    private readonly logger?: PinoLogger,
  ) {
    if (this.logger) this.logger.setContext(LoginUserUseCase.name);
  }

  async execute(email: string, password: string): Promise<{ accessToken: string; user: { id: string; email: string } }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger?.warn({ module: this.MODULE, msg: `Login fallido: El correo electrónico ${email} no existe.` });
      throw new DomainException('Invalid credentials', 401);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      this.logger?.warn({ module: this.MODULE, msg: `Login fallido: Contraseña inválida para el usuario ${email}.` });
      throw new DomainException('Invalid credentials', 401);
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as any,
    });
    this.logger?.info({ module: this.MODULE, msg: `Login exitoso para el usuario ID: ${user.id}` });
    return { accessToken, user: { id: user.id, email: user.email } };
  }
}
