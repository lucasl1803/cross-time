import { Controller, Get, Query } from "@nestjs/common";
import { SessoesService } from "./sessoes.service";

@Controller("sessoes")
export class SessoesController {
  constructor(private readonly service: SessoesService) {}

  @Get()
  listByDate(@Query("date") date: string) {
    return this.service.listByDate(date);
  }
}
