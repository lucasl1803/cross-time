import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PagamentoStatus } from "@prisma/client";

@Injectable()
export class PagamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async criarPixFake(assinaturaIdNum: number) {
    const assinaturaId = BigInt(assinaturaIdNum);

    const assinatura = await this.prisma.assinatura.findUnique({
      where: { id: assinaturaId },
      select: { id: true },
    });

    if (!assinatura) {
      throw new NotFoundException("Assinatura não encontrada.");
    }

    const txid = `PIX-${Date.now()}`;
    const copiaECola = `00020126360014BR.GOV.BCB.PIX0114CROSSTIME-PIX${Date.now()}5204000053039865802BR5920CrossTime Gym6009SAO PAULO62070503***6304ABCD`;

    const pagamento = await this.prisma.pagamento.create({
      data: {
        assinaturaId,
        provedor: "PIX_FAKE",
        valorCentavos: 19990, 
        status: PagamentoStatus.AGUARDANDO,
        txid,
        copiaECola,
      },
      select: {
        id: true,
        status: true,
        txid: true,
        copiaECola: true,
        criadoEm: true,
      },
    });

    return pagamento;
  }
}
