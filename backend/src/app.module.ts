import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { WodsModule } from "./wods/wods.module";
import { SessoesModule } from "./sessoes/sessoes.module";
import { CheckinsModule } from "./checkins/checkins.module";

@Module({
  imports: [HealthModule, WodsModule, SessoesModule, CheckinsModule],
})
export class AppModule {}
