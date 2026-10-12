import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma-service/prisma.service';

// Normaliza "Tecnico RH" → "Tecnico_RH"
function normalizarRol(rol: any): string {
  return String(rol).replace(/\s+/g, '_');
}

// Traduce el rol normalizado a texto legible
function nombreRolLegible(rol: string): string {
  const normalizado = normalizarRol(rol);
  switch (normalizado) {
    case 'Tecnico_RH':
      return 'Técnico de RRHH';
    case 'Admin':
      return 'Administrador';
    case 'Contador':
      return 'Contador';
    case 'Economista':
      return 'Economista';
    case 'SuperAdmin':
      return 'Super Administrador';
    default:
      return normalizado;
  }
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(usuario: string, contrasena: string) {
    const cred = await this.prisma.credenciales.findFirst({
      where: { usuario },
    });

    if (!cred) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await bcrypt.compare(contrasena, cred.contrasena);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const rolNormalizado = normalizarRol(cred.rol);

    const payload = {
      sub: cred.id_credencial,
      usuario: cred.usuario,
      rol: rolNormalizado,
    };

    const token = await this.jwt.signAsync(payload);

    return {
      token,
      usuario: cred.usuario,
      rol: rolNormalizado,
    };
  }

  async crearCredencial(datos: {
    usuario: string;
    contrasena: string;
    rol: string;
  }) {
    const existente = await this.prisma.credenciales.findFirst({
      where: { usuario: datos.usuario },
    });

    if (existente) {
      throw new ConflictException(`El usuario "${datos.usuario}" ya existe`);
    }

    const hash = await bcrypt.hash(datos.contrasena, 10);

    return this.prisma.credenciales.create({
      data: {
        usuario: datos.usuario,
        contrasena: hash,
        rol: datos.rol as any,
      },
      select: {
        id_credencial: true,
        usuario: true,
        rol: true,
      },
    });
  }

  async listarCredenciales() {
    const credenciales = await this.prisma.credenciales.findMany({
      select: { id_credencial: true, usuario: true, rol: true },
      orderBy: { usuario: 'asc' },
    });

    return credenciales.map((c) => ({
      ...c,
      rol: normalizarRol(c.rol),
    }));
  }

  async existeCredencial(usuario: string): Promise<boolean> {
    const existe = await this.prisma.credenciales.findFirst({
      where: { usuario },
      select: { id_credencial: true },
    });
    return existe !== null;
  }

  async findAllCredenciales(
    offset: number,
    limit: number,
  ): Promise<{ data: string[][]; total: number }> {
    const [rawData, total] = await Promise.all([
      this.prisma.credenciales.findMany({
        skip: offset,
        take: limit,
        orderBy: { usuario: 'asc' },
      }),
      this.prisma.credenciales.count(),
    ]);

    const columnas = ['id_credencial', 'usuario', 'rol'] as const;

    const data: string[][] = rawData.map((fila) =>
      columnas.map((col) => {
        const valor = fila[col];
        if (col === 'rol') {
          return nombreRolLegible(String(valor));
        }
        return String(valor);
      }),
    );

    return { data, total };
  }

  async findOneCredencial(id: number): Promise<string[]> {
    const fila = await this.prisma.credenciales.findUnique({
      where: { id_credencial: id },
    });

    if (!fila) return [];

    return [
      String(fila.id_credencial),
      fila.usuario,
      nombreRolLegible(String(fila.rol)),
    ];
  }
}