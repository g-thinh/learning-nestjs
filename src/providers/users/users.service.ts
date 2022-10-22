import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type PartialUser = Omit<User, 'hashedRt' | 'hashedPassword'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new BadRequestException('User not found.');

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new BadRequestException('User not found.');

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { email, password } = createUserDto;
      const hashedPassword = await this.hashData(password);
      const newUser: Prisma.UserCreateInput = { email, hashedPassword };
      const user = await this.prisma.user.create({ data: newUser });
      return this.excludeFields(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('User already exists.');
        }
      }
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<PartialUser[]> {
    try {
      const users = await this.prisma.user.findMany();
      const usersWithoutHashes = users.map((user) =>
        this.excludeUserHash(user),
      );
      return usersWithoutHashes;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<PartialUser> {
    try {
      const user = await this.prisma.user.update({
        where: {
          id,
        },
        data: updateUserDto,
      });

      return this.excludeUserHash(user);
    } catch (error) {
      throw new BadRequestException('Unable to update User.', error);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new BadRequestException('Unable to delete User.', error);
    }
  }

  async setRefreshToken(rt: string, userId: number) {
    const hashedRefreshToken = await bcrypt.hash(rt, 10);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hashedRefreshToken,
      },
    });
  }

  async removeRefreshToken(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: null,
      },
    });
  }

  private excludeFields<User, Key extends keyof User>(
    user: User,
    ...keys: Key[]
  ): Omit<User, Key> {
    for (const key of keys) {
      delete user[key];
    }
    return user;
  }

  excludeUserHash(user: User): PartialUser {
    return this.excludeFields(user, 'hashedPassword', 'hashedRt');
  }

  private async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }
}
