import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs'; // <-- ÚNICO CAMBIO
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { email, password } = createUserDto;
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const userCount = await this.userRepository.count();
    const roleName = userCount === 0 ? 'admin' : 'customer';
    const role = await this.roleRepository.findOneBy({ name: roleName });
    if (!role) {
      throw new InternalServerErrorException(`Role '${roleName}' not found.`);
    }

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role,
    });

    await this.userRepository.save(user);

    const createdUser = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['role'],
    });

    delete createdUser.password;
    return createdUser;
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
        select: ['id', 'email', 'password', 'roleId'],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email: user.email, sub: user.id, role: user.role.name };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }
}