import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() body: { email: string; name: string; role: 'CUSTOMER' | 'CLAIMS_HANDLER', password: string }) {
    return this.usersService.create(body.email, body.name, body.role, body.password);
  }
}
