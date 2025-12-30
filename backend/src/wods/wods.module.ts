import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WodsController } from "./wods.controller";
import { WodsService } from "./wods.service";

@Module({
  controllers: [WodsController],
  providers: [WodsService, PrismaService],
})
export class WodsModule {}
