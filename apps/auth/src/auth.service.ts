import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { NewUserDTO } from './dtos/new-user.dto';
import * as bcrypt from 'bcrypt';
import { ExistingUserDTO } from './dtos/existing-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserEntity, UserRepositoryInterface } from '@app/shared';
import { AuthServiceInterface } from './interface/auth.service.interface';
@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    // @InjectRepository(UserEntity)
    // private readonly userRepository: Repository<UserEntity>,
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    private readonly jwtService: JwtService,
  ) {}
  findById(id: number): Promise<UserEntity> {
    throw new Error('Method not implemented.');
  }

  async getUsers(): Promise<UserEntity[]> {
    return await this.userRepository.findAll();
    // return await this.userRepository.find();
  }
  // async postUser() {
  //   return this.userRepository.save({
  //     lastName: 'ali',
  //   });
  // }
  async findByEmail(email: string): Promise<UserEntity> {
    return await this.userRepository.findByCondition({
      where: { email },
      select: ['email', 'id', 'firstName', 'lastName', 'password'],
    });
    // return await this.userRepository.findOne({
    //   where: { email },
    //   select: ['email', 'id', 'firstName', 'lastName', 'password'],
    // });
  }
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async register(newUser: Readonly<NewUserDTO>): Promise<UserEntity> {
    const { firstName, lastName, email, password } = newUser;

    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('An account with that email already exists!');
    }

    const hashedPassword = await this.hashPassword(password);

    const savedUser = await this.userRepository.save({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    delete savedUser.password;
    return savedUser;
  }

  async doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.findByEmail(email);

    const doesUserExist = !!user;

    if (!doesUserExist) return null; //  throw new NotFoundException('User not found!');

    const doesPasswordMatch = await this.doesPasswordMatch(
      password,
      user.password,
    );

    if (!doesPasswordMatch) return null; //throw new UnauthorizedException('Invalid credentials!');

    return user;
  }

  async login(existingUser: Readonly<ExistingUserDTO>) {
    const { email, password } = existingUser;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    delete user.password;

    const jwt = await this.jwtService.signAsync({
      user,
    });
    return { token: jwt };
  }

  async verifyJwt(jwt: string): Promise<{ exp: number }> {
    if (!jwt) {
      throw new UnauthorizedException();
    }

    try {
      const { exp } = await this.jwtService.verifyAsync(jwt);
      return { exp };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
