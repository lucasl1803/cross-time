import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CheckinsController } from "./checkins.controller";
import { CheckinsService } from "./checkins.service";
import { CheckinsGateway } from "./checkins.gateway";
import { SessoesModule } from "../sessoes/sessoes.module";

@Module({
  imports: [SessoesModule],
  controllers: [CheckinsController],
  providers: [CheckinsService, PrismaService, CheckinsGateway],
})
export class CheckinsModule {}
