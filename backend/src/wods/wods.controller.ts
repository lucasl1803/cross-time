import { Controller, Get } from "@nestjs/common";
import { WodsService } from "./wods.service";

@Controller("wods")
export class WodsController {
  constructor(private readonly service: WodsService) {}

  @Get("today")
  today() {
    return this.service.getToday();
  }
}