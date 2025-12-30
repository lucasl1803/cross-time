import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SessoesController } from "./sessoes.controller";
import { SessoesService } from "./sessoes.service";

@Module({
  controllers: [SessoesController],
  providers: [SessoesService, PrismaService],
})
export class SessoesModule {}
