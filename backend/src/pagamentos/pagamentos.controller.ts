import { Body, Controller, Post } from "@nestjs/common";
import { CreatePixDto } from "./dto/create-pix.dto";
import { PagamentosService } from "./pagamentos.service";

@Controller("pagamentos")
export class PagamentosController {
  constructor(private readonly service: PagamentosService) {}

  @Post("pix")
  criarPix(@Body() dto: CreatePixDto) {
    return this.service.criarPixMercadoPago(dto.assinaturaId);

  }
}
