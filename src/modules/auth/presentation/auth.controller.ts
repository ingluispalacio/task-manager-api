import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { RegisterUserDto } from '../application/dto/register-user.dto';
import { LoginUserDto } from '../application/dto/login-user.dto';
import { AuthResponseDto } from '../application/dto/auth-response.dto';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../application/use-cases/login-user.use-case';
import { GetProfileUseCase } from '../application/use-cases/get-profile.use-case';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly MODULE = 'auth';

  constructor(
    @InjectPinoLogger(AuthController.name)
    private readonly logger: PinoLogger,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {
    this.logger.setContext(AuthController.name);
  }

  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<AuthResponseDto> {
    this.logger.info({ module: this.MODULE, msg: 'Register request', email: dto.email });
    const user = await this.registerUserUseCase.execute(dto.email, dto.password);
    this.logger.info({ module: this.MODULE, msg: 'Register succeeded', userId: user.id, email: user.email });
    return { accessToken: '', user };
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto): Promise<AuthResponseDto> {
    this.logger.info({ module: this.MODULE, msg: 'Login request', email: dto.email });
    const res = await this.loginUserUseCase.execute(dto.email, dto.password);
    this.logger.info({ module: this.MODULE, msg: 'Login succeeded', userId: res.user.id, email: res.user.email });
    return res;
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async me(@Req() req: { user: { userId: string } }): Promise<{ id: string; email: string }> {
    this.logger.info({ module: this.MODULE, msg: 'Me request', userId: req.user.userId });
    const profile = await this.getProfileUseCase.execute(req.user.userId);
    this.logger.info({ module: this.MODULE, msg: 'Me succeeded', userId: profile.id, email: profile.email });
    return profile;
  }
}
