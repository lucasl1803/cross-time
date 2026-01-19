import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const ONE_HOUR_MS = 60 * 60 * 1000;

@Injectable()
export class CheckinsService {
  constructor(private readonly prisma: PrismaService) {}

  private toBigIntId(n: number): bigint {
    if (!Number.isInteger(n) || n <= 0) throw new BadRequestException("ID inválido.");
    return BigInt(n);
  }

  async create(alunoIdNum: number, sessaoIdNum: number) {
    const alunoId = this.toBigIntId(alunoIdNum);
    const sessaoId = this.toBigIntId(sessaoIdNum);

    const assinaturaAtiva = await this.prisma.assinatura.findFirst({
      where: { usuarioId: alunoId, status: "ATIVA" },
      select: { id: true, dataFim: true },
    });

    if (!assinaturaAtiva) {
      throw new ForbiddenException("Você precisa de uma assinatura ATIVA para fazer check-in.");
    }

    if (assinaturaAtiva.dataFim && new Date(assinaturaAtiva.dataFim).getTime() < Date.now()) {
      throw new ForbiddenException("Sua assinatura está expirada.");
    }

    return this.prisma.$transaction(async (tx) => {
      const sessao = await tx.sessaoAula.findUnique({
        where: { id: sessaoId },
        select: { id: true, status: true, capacidade: true, dataAula: true, horaInicio: true },
      });

      if (!sessao) throw new NotFoundException("Sessão não encontrada.");
      if (sessao.status === "CANCELADA") throw new BadRequestException("Sessão cancelada.");

      const inicio = this.buildStartDateTime(sessao.dataAula, sessao.horaInicio);
      if (inicio.getTime() <= Date.now()) {
        throw new BadRequestException("A aula já iniciou, não é possível fazer check-in.");
      }

      const ja = await tx.reserva.findFirst({
        where: { sessaoId, alunoId, status: "CONFIRMADA" },
        select: { id: true },
      });
      if (ja) throw new ConflictException("Você já fez check-in nessa sessão.");

      const confirmadas = await tx.reserva.count({
        where: { sessaoId, status: "CONFIRMADA" },
      });

      if (confirmadas >= sessao.capacidade) {
        await tx.sessaoAula.update({ where: { id: sessaoId }, data: { status: "LOTADA" } });
        throw new ConflictException("Sessão lotada.");
      }

      const reserva = await tx.reserva.create({
        data: { sessaoId, alunoId, status: "CONFIRMADA" },
      });

      if (confirmadas + 1 >= sessao.capacidade && sessao.status !== "LOTADA") {
        await tx.sessaoAula.update({ where: { id: sessaoId }, data: { status: "LOTADA" } });
      }

      return reserva;
    });
  }

  async cancel(alunoIdNum: number, sessaoIdNum: number) {
    const alunoId = this.toBigIntId(alunoIdNum);
    const sessaoId = this.toBigIntId(sessaoIdNum);

    return this.prisma.$transaction(async (tx) => {
      const sessao = await tx.sessaoAula.findUnique({
        where: { id: sessaoId },
        select: { id: true, status: true, dataAula: true, horaInicio: true },
      });
      if (!sessao) throw new NotFoundException("Sessão não encontrada.");

      const inicio = this.buildStartDateTime(sessao.dataAula, sessao.horaInicio);
      if (Date.now() > inicio.getTime() - ONE_HOUR_MS) {
        throw new ForbiddenException("Cancelamento permitido apenas até 1 hora antes do início.");
      }

      const reserva = await tx.reserva.findFirst({
        where: { sessaoId, alunoId, status: "CONFIRMADA" },
        select: { id: true },
      });
      if (!reserva) throw new NotFoundException("Check-in não encontrado para esta sessão.");

      const updated = await tx.reserva.update({
        where: { id: reserva.id },
        data: { status: "CANCELADA", canceladoEm: new Date() },
      });

      if (sessao.status === "LOTADA") {
        await tx.sessaoAula.update({ where: { id: sessaoId }, data: { status: "ABERTA" } });
      }

      return updated;
    });
  }
  async listByAluno(alunoIdNum: number) {
    const alunoId = this.toBigIntId(alunoIdNum);

    return this.prisma.reserva.findMany({
      where: { alunoId },
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        status: true,
        criadoEm: true,
        canceladoEm: true,
        sessao: {
          select: {
            id: true,
            dataAula: true,
            horaInicio: true,
            duracaoMinutos: true,
            capacidade: true,
            status: true,
            wod: { select: { id: true, titulo: true } },
          },
        },
      },
    });
  }

  private buildStartDateTime(dataAula: Date, horaInicio: Date): Date {
    const start = new Date(dataAula);
    const time = new Date(horaInicio);
    start.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
    return start;
  }
  
}
