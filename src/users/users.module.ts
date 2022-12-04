import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TokenLogRepository } from 'src/database_table/repository/token-log.repository';

@Module({
  imports: [ 
    TypeOrmModule.forFeature([
      TokenLogRepository])
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports:[UsersService]
})
export class UsersModule {}
