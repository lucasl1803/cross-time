import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { CreateCheckinDto } from "./dto/create-checkin.dto";
import { CheckinsService } from "./checkins.service";

@Controller("checkins")
export class CheckinsController {
  constructor(private readonly service: CheckinsService) {}

  @Get()
  list(@Query("alunoId") alunoId: string) {
    return this.service.listByAluno(Number(alunoId));
  }

  @Post()
  create(@Body() dto: CreateCheckinDto) {
    return this.service.create(dto.alunoId, dto.sessaoId);
  }

  @Delete(":sessaoId/:alunoId")
  cancel(@Param("sessaoId") sessaoId: string, @Param("alunoId") alunoId: string) {
    return this.service.cancel(Number(alunoId), Number(sessaoId));
  }
}
