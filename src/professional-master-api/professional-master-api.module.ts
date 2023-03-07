import { Module } from '@nestjs/common';
import { ProfessionalMasterApiService } from './professional-master-api.service';
import { ProfessionalMasterApiController } from './professional-master-api.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessionalCategoryRepository } from '../database_table/repository/ms_professional_category.repository';
import { MasterProfessionalListRepository } from 'src/database_table/repository/master-professional-list.repository';
import { ProfessionalPresenceDetailsRepository } from 'src/database_table/repository/ms_professional_presence_details.repository';
import { MasterPrescriptionListRepository } from 'src/database_table/repository/master-prescription-list.repository';
import { MasterPromotionRepository } from 'src/database_table/repository/master-promotion.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProfessionalCategoryRepository, MasterProfessionalListRepository, ProfessionalPresenceDetailsRepository, MasterPrescriptionListRepository, MasterPromotionRepository])],
  controllers: [ProfessionalMasterApiController],
  providers: [ProfessionalMasterApiService]
})
export class ProfessionalMasterApiModule { }
