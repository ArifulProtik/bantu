import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
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
  @Post(':id/follow')
  followUser(@GetUser() user: User, @Param('id') id: string) {
    return this.userService.followUser(user.id, id);
  }
  @Post(':id/unfollow')
  unfollowUser(@GetUser() user: User, @Param('id') id: string) {
    return this.userService.unfollowUser(user.id, id);
  }
  @Get(':id/followers')
  getFollowers(@Param('id') id: string) {
    return this.userService.getFollower(id);
  }
  @Get(':id/following')
  getFollowing(@Param('id') id: string) {
    return this.userService.getFollowing(id);
  }
}
