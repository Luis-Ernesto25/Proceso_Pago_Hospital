import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, tipo_rol } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function crearCredencial(
  usuario: string,
  contrasenaPlano: string,
  rol: tipo_rol,
) {
  const existente = await prisma.credenciales.findFirst({ where: { usuario } });
  if (existente) {
    console.log(`⏭️  "${usuario}" ya existe, se omite.`);
    return;
  }

  const hash = await bcrypt.hash(contrasenaPlano, 10);
  await prisma.credenciales.create({
    data: { usuario, contrasena: hash, rol },
  });
  console.log(`✅ Creado: usuario="${usuario}" rol="${rol}"`);
}

async function main() {
  //await crearCredencial('admin', 'admin123', tipo_rol.Admin);
  await crearCredencial('yoyi', 'yoyi', tipo_rol.Tecnico_RH);
  await crearCredencial('contador', 'contador', tipo_rol.Contador);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());