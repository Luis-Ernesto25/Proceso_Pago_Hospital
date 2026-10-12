import { Injectable } from '@nestjs/common';
import { CreateEmpleadoOcupacionDto } from './dto/create-empleado_ocupacion.dto';
import { UpdateEmpleadoOcupacionDto } from './dto/update-empleado_ocupacion.dto';
import { PrismaService } from 'src/prisma-service/prisma.service';

@Injectable()
export class EmpleadoOcupacionService {
private totalFilas: number | null = null;

  constructor(private prisma: PrismaService){}


  create(createEmpleadoOcupacionDto: CreateEmpleadoOcupacionDto) {
    return 'This action adds a new empleadoOcupacion';
  }


async findAll(offset: number, limit: number): Promise<{ data: string[][]; total: number }> {
  const rawData = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
    SELECT * FROM empleado_ocupacion
    ORDER BY id_em
    OFFSET ${offset} LIMIT ${limit}
  `;

  const data: string[][] = rawData.map((fila) =>
    Object.values(fila).map((valor) => String(valor))
  );

  // Solo cuenta si aún no lo hemos hecho
  if (this.totalFilas === null) {
    const totalResult = await this.prisma.$queryRaw<Array<{ total: number | bigint }>>`
      SELECT COUNT(*) as total FROM empleado_ocupacion
    `;
    this.totalFilas = Number(totalResult[0]?.total ?? 0);
  }

  return { data, total: this.totalFilas };
}

async findOne(id: number): Promise<string[]> {
  const rawData = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
    SELECT * FROM empleado_ocupacion WHERE id_em = ${id}
  `;
  // rawData[0] es el primer objeto (si existe)
  const fila = rawData[0] || {};
  return Object.values(fila) as string[];
}

  update(id: number, updateEmpleadoOcupacionDto: UpdateEmpleadoOcupacionDto) {
    return `This action updates a #${id} empleadoOcupacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} empleadoOcupacion`;
  }
}
