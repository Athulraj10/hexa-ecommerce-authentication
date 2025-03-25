import { Expose } from "class-transformer";
import { IsEmail, IsIn, isNumber, IsString, Length } from "class-validator";
import { UserRole } from "src/services/Enums.role";

export class SignupDto {
  @IsString({ message: 'username must be a string...' })
  @Expose()
  name: string;

  @IsEmail()
  email: string;

  @IsString({message:'password must be a 6 - 20 length...'})
  @Length(6, 20)
  password!: string;

  @IsString()
  @Length(6,16)
  phoneNo!: string;

  @IsString()
  @IsIn(Object.values(UserRole), { message: 'Invalid role. Must be one of: ' + Object.values(UserRole).join(', ') })
  role!: UserRole;

}
