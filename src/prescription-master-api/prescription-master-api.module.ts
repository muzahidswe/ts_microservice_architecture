import { Module } from '@nestjs/common';
import { PrescriptionMasterApiService } from './prescription-master-api.service';
import { PrescriptionMasterApiController } from './prescription-master-api.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionImageDetailsRepository } from '../database_table/repository/ms_prescription_image_details.repository';
import { MasterPrescriptionListRepository } from 'src/database_table/repository/master-prescription-list.repository';
@Module({
  imports: [TypeOrmModule.forFeature([PrescriptionImageDetailsRepository, MasterPrescriptionListRepository])],
  controllers: [PrescriptionMasterApiController],
  providers: [PrescriptionMasterApiService]
})
export class PrescriptionMasterApiModule { }
