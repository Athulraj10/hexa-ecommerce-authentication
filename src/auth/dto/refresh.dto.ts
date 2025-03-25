import { IsString } from "class-validator";

export class RefreshTokenDto {
  @IsString({message:'RefreshToken must be available'})
  refreshToken!: string;
}
