import { IsEmail, IsString, Length } from 'class-validator';
import { Expose } from 'class-transformer';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @Expose() // Ensures this field is included in the transformed object
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @Length(6, 20)
  @Expose() // Ensures this field is included in the transformed object
  password!: string;
}