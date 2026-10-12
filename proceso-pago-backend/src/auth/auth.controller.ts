import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UseGuards,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-dto.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) { }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, usuario, rol } = await this.auth.login(
      dto.usuario,
      dto.contrasena,
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
      path: '/',
    });

    return { usuario, rol };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', { path: '/' });
    return { message: 'Sesión cerrada' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request) {
    return req['user'];
  }

  // 👇 Solo delegan al service

  @Post('credenciales')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  crearCredencial(
    @Body() body: { usuario: string; contrasena: string; rol: string },
  ) {
    return this.auth.crearCredencial(body);
  }

  @Get('credenciales')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  listarCredenciales() {
    return this.auth.listarCredenciales();
  }

  @Get('credenciales/paginado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  findAllCredenciales(
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.auth.findAllCredenciales(offset, limit);
  }

  @Get('credenciales/basico/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  findOneCredencial(@Param('id', ParseIntPipe) id: number) {
    return this.auth.findOneCredencial(id);
  }
  @Get('credenciales/existe/:usuario')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async existeCredencial(@Param('usuario') usuario: string) {
    const existe = await this.auth.existeCredencial(usuario);
    return { existe };
  }
}