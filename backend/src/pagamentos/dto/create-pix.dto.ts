import { IsInt, Min } from "class-validator";

export class CreatePixDto {
  @IsInt()
  @Min(1)
  assinaturaId!: number;
}

