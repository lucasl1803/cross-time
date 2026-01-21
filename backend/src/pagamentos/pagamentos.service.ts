import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PagamentoStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import axios from "axios";

@Injectable()
export class PagamentosService {
  constructor(private readonly prisma: PrismaService) {}

  private mp = axios.create({
    baseURL: process.env.MP_BASE_URL || "https://api.mercadopago.com",
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN || ""}`,
      "Content-Type": "application/json",
    },
  });

  /**
   * PIX REAL - Mercado Pago
   * Entrada: assinaturaId (number) vindo do front (ex: 1)
   * Banco: assinatura.id = BigInt
   *
   * Retorna:
   * - copiaECola (qr_code)
   * - qrBase64 (qr_code_base64)
   * - txid (id do pagamento no MP)
   */
  async criarPixMercadoPago(assinaturaId: number) {
    // 0) converter number -> BigInt
    const assinaturaIdBigInt = BigInt(assinaturaId);

    // 1) validar se assinatura existe
    const assinatura = await this.prisma.assinatura.findUnique({
      where: { id: assinaturaIdBigInt },
      select: { id: true },
    });

    if (!assinatura) throw new NotFoundException("Assinatura não encontrada.");

    // 2) validar token do Mercado Pago
    if (!process.env.MP_ACCESS_TOKEN) {
      throw new Error("Defina MP_ACCESS_TOKEN no .env do backend.");
    }

    const transactionAmount = 199.9;

    // 3) criar PIX no Mercado Pago
    const resp = await this.mp.post(
      "/v1/payments",
      {
        transaction_amount: transactionAmount,
        description: `Assinatura ${assinatura.id.toString()} - CrossTime`,
        payment_method_id: "pix",
        payer: { email: "lucaslealc1803@gmail.com" },
      },
      {
        headers: {
          "X-Idempotency-Key": randomUUID(),
        },
      },
    );

    const mpPayment = resp.data;

    const txData = mpPayment?.point_of_interaction?.transaction_data;
    const copiaECola = txData?.qr_code;
    const qrBase64 = txData?.qr_code_base64;

    if (!copiaECola || !qrBase64) {
      throw new Error("Mercado Pago não retornou qr_code/qr_code_base64.");
    }

    // 4) salvar pagamento no banco
    const pagamento = await this.prisma.pagamento.create({
      data: {
        assinaturaId: assinaturaIdBigInt, // ✅ BigInt
        provedor: "MERCADO_PAGO_PIX",
        valorCentavos: Math.round(transactionAmount * 100),
        status: PagamentoStatus.AGUARDANDO,
        txid: String(mpPayment.id),
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

    return {
      id: pagamento.id.toString(),
      status: pagamento.status,
      txid: pagamento.txid,
      copiaECola: pagamento.copiaECola,
      qrBase64,
      criadoEm: pagamento.criadoEm,
    };
  }

  /**
   * PIX FAKE - fallback (se quiser testar sem MP)
   */
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

    return {
      id: pagamento.id.toString(),
      status: pagamento.status,
      txid: pagamento.txid,
      copiaECola: pagamento.copiaECola,
      criadoEm: pagamento.criadoEm,
    };
  }
}