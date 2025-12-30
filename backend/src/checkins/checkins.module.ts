import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CheckinsController } from "./checkins.controller";
import { CheckinsService } from "./checkins.service";

@Module({
  controllers: [CheckinsController],
  providers: [CheckinsService, PrismaService],
})
export class CheckinsModule {}
