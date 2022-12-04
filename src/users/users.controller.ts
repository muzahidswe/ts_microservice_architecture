import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,Response, Req
} from '@nestjs/common';;
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class UsersController {
}
