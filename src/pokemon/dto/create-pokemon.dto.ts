import { IsDefined, IsNumber, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreatePokemonDto {

  @IsNumber()
  @IsDefined()
  @IsPositive()
  @Min(1)
  no: number

  @IsString()
  @IsDefined()
  @MinLength(1)
  name: string
}
