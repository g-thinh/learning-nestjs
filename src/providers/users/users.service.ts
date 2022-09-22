import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Loaded, wrap } from '@mikro-orm/core';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async findAllUsers(): Promise<
    Loaded<User, 'email' | 'id' | 'createdAt' | 'updatedAt'>[]
  > {
    const users = await this.userRepository.findAll({
      fields: ['id', 'createdAt', 'updatedAt', 'email'],
    });
    return users;
  }

  async findByUserId(userId: number): Promise<User | undefined> {
    try {
      const user = await this.userRepository.findOneOrFail(userId);
      return user;
    } catch (error) {
      throw new BadRequestException('User not found.', error);
    }
  }

  async findByEmail(userEmail: string): Promise<User | undefined> {
    try {
      const user = await this.userRepository.findOneOrFail({
        email: userEmail,
      });

      return user;
    } catch (error) {
      throw new BadRequestException('User not found.', error);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      email,
      hashedPassword,
    });

    await this.userRepository.persistAndFlush([newUser]);
    return newUser;
  }

  async update(id: number, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne(id);
    wrap(user).assign(updateDto);
    await this.userRepository.flush();
    return user;
  }

  async delete(userId: number) {
    return this.userRepository.nativeDelete({ id: userId });
  }
}
