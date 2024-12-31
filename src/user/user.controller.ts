import { Body, Controller, Put } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { PasswordDto, UpdateUserDto } from './dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Put()
  updateUser(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.UpoateUser(user.id, updateUserDto);
  }
  @Put('changepassword')
  changePassword(@GetUser() user: User, @Body() passwordDto: PasswordDto) {
    return this.userService.ChangePassword(user.id, passwordDto);
  }
}
