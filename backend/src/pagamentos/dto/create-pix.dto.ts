import { IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreatePixDto {
  @Type(() => Number) // garante conversão "1" -> 1
  @IsInt()
  @Min(1)
  assinaturaId: number;
}
