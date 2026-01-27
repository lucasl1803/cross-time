import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { CheckinsService } from "./checkins.service";
import { SessoesService } from "../sessoes/sessoes.service";

type CheckinPayload = {
  alunoId: number;
  sessaoId: number;
};

@WebSocketGateway({
  cors: { origin: "*" },
})
export class CheckinsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly checkinsService: CheckinsService,
    private readonly sessoesService: SessoesService,
  ) {}

  // aluno faz checkin pelo websocket

@SubscribeMessage("checkin:create")
async handleCheckinCreate(@MessageBody() payload: CheckinPayload) {
  const { alunoId, sessaoId } = payload;

  const created = await this.checkinsService.create(alunoId, sessaoId);

  const updated = await this.sessoesService.getSessaoResumo(sessaoId);

  // ✅ se por algum motivo vier null, não emite lixo
  if (updated) {
    this.server.emit("sessao:updated", updated);
  }

  return created;
}


}
