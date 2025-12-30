import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

function parseDateOnly(input: string): Date {
  const ok = /^\d{4}-\d{2}-\d{2}$/.test(input);
  if (!ok) throw new BadRequestException("Parâmetro date inválido. Use YYYY-MM-DD.");
  const [y, m, d] = input.split("-").map(Number);
  return new Date(y, m - 1, d);
}

@Injectable()
export class SessoesService {
  constructor(private readonly prisma: PrismaService) {}

  async listByDate(dateStr: string) {
    const date = parseDateOnly(dateStr);

    return this.prisma.sessaoAula.findMany({
      where: { dataAula: date },
      orderBy: { horaInicio: "asc" },
      select: {
        id: true,
        dataAula: true,
        horaInicio: true,
        duracaoMinutos: true,
        capacidade: true,
        status: true,
        wod: { select: { id: true, titulo: true } },
      },
    });
  }
}
