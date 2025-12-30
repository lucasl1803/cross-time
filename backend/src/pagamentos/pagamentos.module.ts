import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PagamentosController } from "./pagamentos.controller";
import { PagamentosService } from "./pagamentos.service";

@Module({
  controllers: [PagamentosController],
  providers: [PagamentosService, PrismaService],
})
export class PagamentosModule {}
