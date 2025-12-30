import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WodsService {
  constructor(private readonly prisma: PrismaService) {}

  async getToday() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const wod = await this.prisma.wod.findUnique({
      where: { dataWod: today },
      select: { id: true, dataWod: true, titulo: true, descricao: true },
    });

    if (!wod) throw new NotFoundException("WOD do dia não encontrado.");
    return wod;
  }
}
