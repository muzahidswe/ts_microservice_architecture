import { Module } from '@nestjs/common';
import { PromotionMasterApiService } from './promotion-master-api.service';
import { PromotionMasterApiController } from './promotion-master-api.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionCategoryRepository } from '../database_table/repository/ms_promotion_category.repository';
import { MasterPromotionRepository } from 'src/database_table/repository/master-promotion.repository';
@Module({
  imports: [TypeOrmModule.forFeature([PromotionCategoryRepository, MasterPromotionRepository])],
  controllers: [PromotionMasterApiController],
  providers: [PromotionMasterApiService]
})
export class PromotionMasterApiModule { }
