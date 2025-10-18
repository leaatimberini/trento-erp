import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }): Promise<User> {
    // --- INICIO DE LA CORRECCIÓN ---
    // Usamos findOne con 'relations' para asegurarnos de cargar el rol del usuario.
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['role'],
    });
    // --- FIN DE LA CORRECCIÓN ---

    if (!user) {
      throw new UnauthorizedException();
    }
    // El objeto 'user' completo (incluyendo su 'role') se adjuntará al objeto 'request'.
    return user;
  }
}