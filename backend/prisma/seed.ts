import {
  PrismaClient,
  UsuarioTipo,
  AssinaturaStatus,
  SessaoStatus,
  ReservaStatus,
  PagamentoStatus,
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  // Limpa base respeitando FKs
  await prisma.reserva.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.assinatura.deleteMany();
  await prisma.sessaoAula.deleteMany();
  await prisma.wod.deleteMany();
  await prisma.plano.deleteMany();
  await prisma.usuario.deleteMany();

  // senha fake (não usadas no login simulado)
  const senhaCoach = await bcrypt.hash("123mudar", 10);
  const senhaAluno = await bcrypt.hash("123mudar", 10);

  //  Usuários sistema
  const coach = await prisma.usuario.create({
    data: {
      nome: "Ana Luiza",
      email: "coach@gmail.com",
      senhaHash: senhaCoach,
      tipo: UsuarioTipo.ADMIN,
      ativo: true,
    },
  });

  const aluno = await prisma.usuario.create({
    data: {
      nome: "Lucas Leal",
      email: "lucas@gmail.com",
      senhaHash: senhaAluno,
      tipo: UsuarioTipo.ALUNO,
      ativo: true,
    },
  });

  // Plano 
  const planoMensal = await prisma.plano.create({
    data: {
      nome: "Plano Mensal",
      valorCentavos: 19990,
      duracaoDias: 30,
      ativo: true,
    },
  });

  // Assinatura ativa
  const hoje = new Date();
  const assinatura = await prisma.assinatura.create({
    data: {
      usuarioId: aluno.id,
      planoId: planoMensal.id,
      status: AssinaturaStatus.ATIVA,
      dataInicio: hoje,
      dataFim: addDays(hoje, 30),
    },
  });

  await prisma.pagamento.create({
    data: {
      assinaturaId: assinatura.id,
      provedor: "PIX_FAKE",
      valorCentavos: 19990,
      status: PagamentoStatus.PAGO,
      txid: "TXID-FAKE-001",
      copiaECola: "00020126580014BR.GOV.BCB.PIX0136CROSSTIMEFAKE",
      qrCodeBase64: null,
      pagoEm: new Date(),
    },
  });

  // Wod do dia
  const wodHoje = await prisma.wod.create({
    data: {
      dataWod: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
      titulo: "WOD do Dia",
      descricao: "For time: 21-15-9 Thrusters + Pull-ups",
    },
  });

  // 
  // Sessoes de aula

  const sessaoManha = await prisma.sessaoAula.create({
    data: {
      dataAula: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
      horaInicio: new Date("1970-01-01T07:00:00.000Z"),
      duracaoMinutos: 60,
      capacidade: 12,
      status: SessaoStatus.ABERTA,
      wodId: wodHoje.id,
    },
  });

  await prisma.sessaoAula.create({
    data: {
      dataAula: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
      horaInicio: new Date("1970-01-01T18:00:00.000Z"),
      duracaoMinutos: 60,
      capacidade: 16,
      status: SessaoStatus.ABERTA,
      wodId: wodHoje.id,
    },
  });

  // RESERVA DO Aluno
  await prisma.reserva.create({
    data: {
      sessaoId: sessaoManha.id,
      alunoId: aluno.id,
      status: ReservaStatus.CONFIRMADA,
    },
  });

  console.log("✅ Seed concluído com sucesso");
  console.log({
    coach: coach.email,
    aluno: aluno.email,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
