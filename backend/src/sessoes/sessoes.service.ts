import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

function parseDateOnly(input: string): Date {
  const ok = /^\d{4}-\d{2}-\d{2}$/.test(input);
  if (!ok) {
    throw new BadRequestException("Parâmetro date inválido. Use YYYY-MM-DD.");
  }

  const [y, m, d] = input.split("-").map(Number);
  // data "local" (00:00)
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function dayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

@Injectable()
export class SessoesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   *sessões de um dia, já devolvendo inscritos (reservas confirmadas e não canceladas)
   */
  async listByDate(dateStr: string) {
    const baseDate = parseDateOnly(dateStr);
    const { start, end } = dayRange(baseDate);

    const sessoes = await this.prisma.sessaoAula.findMany({
      where: {
        dataAula: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { horaInicio: "asc" },
      select: {
        id: true,
        dataAula: true,
        horaInicio: true,
        duracaoMinutos: true,
        capacidade: true,
        status: true,
        wod: {
          select: {
            id: true,
            titulo: true,
          },
        },
        _count: {
          select: {
            reservas: {
              where: {
                status: "CONFIRMADA",
                canceladoEm: null,
              },
            },
          },
        },
      },
    });

    return sessoes.map((s) => ({
      id: Number(s.id),
      dataAula: s.dataAula,
      horaInicio: s.horaInicio,
      duracaoMinutos: s.duracaoMinutos,
      capacidade: Number(s.capacidade ?? 0),
      status: s.status,
      wod: s.wod,
      inscritos: s._count.reservas,
    }));
  }

  /**
   * atualizar UI em tempo real (ex: emitir no websocket)
   */
  async getSessaoResumo(sessaoId: number) {
    const sessao = await this.prisma.sessaoAula.findUnique({
      where: { id: BigInt(sessaoId) },
      select: {
        id: true,
        capacidade: true,
        status: true,
        _count: {
          select: {
            reservas: {
              where: {
                status: "CONFIRMADA",
                canceladoEm: null,
              },
            },
          },
        },
      },
    });

    if (!sessao) return null;

    return {
      sessaoId: Number(sessao.id),
      capacidade: Number(sessao.capacidade ?? 0),
      inscritos: sessao._count.reservas,
      status: sessao.status,
    };
  }
}
