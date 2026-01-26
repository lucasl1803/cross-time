import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Post("login")
  async login(@Body("email") email: string) {
    if (!email) {
      throw new UnauthorizedException("Email obrigatório");
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        ativo: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException("Usuário não autorizado");
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
    };
  }
}