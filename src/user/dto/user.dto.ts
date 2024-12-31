import { IsNotEmpty, MinLength } from 'class-validator';

export class UpdateUserNameDto {
  @IsNotEmpty()
  username: string;
}
export class UpdateUserDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  profile_picture: string;
  @IsNotEmpty()
  username: string;
}
export class PasswordDto {
  @IsNotEmpty()
  @MinLength(8)
  old_password: string;
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
