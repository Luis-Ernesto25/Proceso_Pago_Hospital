import { Injectable } from '@nestjs/common';
import { CreateEmpleadoBonoDto } from './dto/create-empleado_bono.dto';
import { UpdateEmpleadoBonoDto } from './dto/update-empleado_bono.dto';
import { PrismaService } from 'src/prisma-service/prisma.service';

@Injectable()
export class EmpleadoBonoService {

  private totalFilas: number | null = null
  constructor(private prisma: PrismaService) { }

  create(createEmpleadoBonoDto: CreateEmpleadoBonoDto) {
    return 'This action adds a new empleadoBono';
  }


  async findAll(offset: number, limit: number): Promise<{ data: string[][]; total: number }> {
    // 1. Agrupar bonos por empleado, paginando por empleado
    const rawData = await this.prisma.$queryRaw<
      Array<{ id_em: number; bonos: string[] }>
    >`
    SELECT 
      id_em,
      array_agg(id_bo ORDER BY id_bo) AS bonos
    FROM empleado_bono
    GROUP BY id_em
    ORDER BY id_em
    OFFSET ${offset} LIMIT ${limit}
  `;

    // 2. Convertir cada fila a array de strings
    const data: string[][] = rawData.map((fila) => [
      String(fila.id_em),
      fila.bonos.join(','),
    ]);

    // 3. Total de EMPLEADOS, cacheado
    if (this.totalFilas === null) {
      const totalResult = await this.prisma.$queryRaw<
        Array<{ total: number | bigint }>
      >`
      SELECT COUNT(DISTINCT id_em) AS total FROM empleado_bono
    `;
      this.totalFilas = Number(totalResult[0]?.total ?? 0);
    }

    return { data, total: this.totalFilas };
  }

  async findOne(id: number): Promise<string[]> {
    const res = await this.prisma.empleado_bono.findMany({
      where: { id_em: id },
      orderBy: { id_bo: 'asc' },
    });

    if (res.length === 0) return [];

    const bonos = res.map((fila) => fila.id_bo).join(',');

    return [String(res[0].id_em), bonos];
  }


  update(id: number, updateEmpleadoBonoDto: UpdateEmpleadoBonoDto) {
    return `This action updates a #${id} empleadoBono`;
  }

  remove(id: number) {
    return `This action removes a #${id} empleadoBono`;
  }
}
