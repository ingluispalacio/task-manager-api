import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.model';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(@InjectRepository(UserEntity) private readonly repository: Repository<UserEntity>) {}

  async create(user: User): Promise<User> {
    const entity = this.repository.create({
      id: user.id,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    const saved = await this.repository.save(entity);
    return new User(saved.id, saved.email, saved.password, saved.createdAt, saved.updatedAt);
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? new User(entity.id, entity.email, entity.password, entity.createdAt, entity.updatedAt) : null;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? new User(entity.id, entity.email, entity.password, entity.createdAt, entity.updatedAt) : null;
  }
}
