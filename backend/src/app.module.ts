import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { HealthModule } from "./health/health.module";
import { WodsModule } from "./wods/wods.module";
import { SessoesModule } from "./sessoes/sessoes.module";
import { CheckinsModule } from "./checkins/checkins.module";
import { PagamentosModule } from "./pagamentos/pagamentos.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    HealthModule,
    WodsModule,
    SessoesModule,
    CheckinsModule,
    PagamentosModule,
  ],
})
export class AppModule {}