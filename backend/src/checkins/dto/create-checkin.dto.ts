import { IsInt, Min } from "class-validator";

export class CreateCheckinDto {
  @IsInt()
  @Min(1)
  alunoId!: number;

  @IsInt()
  @Min(1)
  sessaoId!: number;
}
