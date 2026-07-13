import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import * as bcrypt from 'bcryptjs';
import { AuthController } from '../../../src/modules/auth/presentation/auth.controller';
import { RegisterUserUseCase } from '../../../src/modules/auth/application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../../src/modules/auth/application/use-cases/login-user.use-case';
import { GetProfileUseCase } from '../../../src/modules/auth/application/use-cases/get-profile.use-case';
import { JwtStrategy } from '../../../src/modules/auth/infrastructure/strategies/jwt.strategy';
import { USER_REPOSITORY, UserRepository } from '../../../src/modules/auth/domain/user.repository';
import { User } from '../../../src/modules/auth/domain/user.model';
import { TasksController } from '../../../src/modules/tasks/presentation/tasks.controller';
import { CreateTaskUseCase } from '../../../src/modules/tasks/application/use-cases/create-task.use-case';
import { ListTasksUseCase } from '../../../src/modules/tasks/application/use-cases/list-tasks.use-case';
import { GetTaskUseCase } from '../../../src/modules/tasks/application/use-cases/get-task.use-case';
import { UpdateTaskUseCase } from '../../../src/modules/tasks/application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '../../../src/modules/tasks/application/use-cases/delete-task.use-case';
import { TASK_REPOSITORY, TaskRepository } from '../../../src/modules/tasks/domain/task.repository';
import { Task } from '../../../src/modules/tasks/domain/task.model';

export async function createIntegrationApp(): Promise<{
  app: INestApplication;
  userRepository: InMemoryUserRepository;
  taskRepository: InMemoryTaskRepository;
}> {
  const userRepository = new InMemoryUserRepository();
  const taskRepository = new InMemoryTaskRepository();

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      PassportModule,
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1h', },
      }),
    ],
    controllers: [AuthController, TasksController],
    providers: [
      RegisterUserUseCase,
      LoginUserUseCase,
      GetProfileUseCase,
      CreateTaskUseCase,
      ListTasksUseCase,
      GetTaskUseCase,
      UpdateTaskUseCase,
      DeleteTaskUseCase,
      JwtStrategy,
      {
        provide: ConfigService,
        useValue: {
          get: (key: string) =>
            key === 'JWT_SECRET' ? 'test-secret' : key === 'JWT_EXPIRES_IN' ? '1h' : undefined,
        },
      },
      { provide: USER_REPOSITORY, useValue: userRepository },
      { provide: TASK_REPOSITORY, useValue: taskRepository },
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.init();

  return { app, userRepository, taskRepository };
}

export async function seedUser(
  userRepository: InMemoryUserRepository,
  email = 'user@example.com',
  password = 'password123',
): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);
  return userRepository.create(new User('user-1', email, hashedPassword, new Date(), new Date()));
}

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }
}

export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Task[] = [];

  async create(task: Task): Promise<Task> {
    this.tasks.push(task);
    return task;
  }

  async findByUserId(userId: string, page: number, limit: number): Promise<Task[]> {
    return this.tasks.filter((task) => task.userId === userId).slice((page - 1) * limit, page * limit);
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.find((task) => task.id === id) ?? null;
  }

  async update(task: Task): Promise<Task> {
    this.tasks = this.tasks.map((current) => (current.id === task.id ? task : current));
    return task;
  }

  async delete(id: string): Promise<void> {
    this.tasks = this.tasks.filter((task) => task.id !== id);
  }
}
