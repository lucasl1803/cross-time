import { Controller, Get, Query } from "@nestjs/common";
import { SessoesService } from "./sessoes.service";

function todayYYYYMMDD(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

@Controller("sessoes")
export class SessoesController {
  constructor(private readonly service: SessoesService) {}

  @Get()
  listByDate(@Query("date") date?: string) {
    const dateStr = date?.trim() ? date.trim() : todayYYYYMMDD();
    return this.service.listByDate(dateStr);
  }
}
