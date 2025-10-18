import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { User } from './entities/user.entity'; // Importar la entidad User para tener tipado

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: User = request.user; // Obtenemos el objeto User completo

    // --- INICIO DE LA CORRECCIÓN ---
    // Comparamos el rol requerido con la propiedad 'name' del rol del usuario.
    return requiredRoles.some((role) => user.role?.name === role);
    // --- FIN DE LA CORRECCIÓN ---
  }
}