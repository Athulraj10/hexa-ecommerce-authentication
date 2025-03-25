import { Expose, Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

class authUserDto {
  @IsString({ message: 'User ID must be a string' })
  @Expose()
  userId!: string;

  @IsString({ message: 'Role must be a string' })
  @Expose()
  role!: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'Password must be a string' })
  @Expose()
  password!: string;

  @IsString({ message: 'Old password must be a string' })
  @Expose()
  oldPassword!: string;

  @ValidateNested() // Ensures nested validation is applied
  @Type(() => authUserDto) // Required to transform and validate nested objects
  @Expose()
  authUser!: authUserDto;
}
