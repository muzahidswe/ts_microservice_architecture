import { HttpException, HttpStatus, Injectable, Logger, NotFoundException} from '@nestjs/common';
import { CreatePrescriptionMasterApiDto } from './dto/create-prescription-master-api.dto';
import { UpdatePrescriptionMasterApiDto } from './dto/update-prescription-master-api.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PrescriptionImageDetailsRepository } from '../database_table/repository/ms_prescription_image_details.repository';
import { MasterPrescriptionListRepository } from 'src/database_table/repository/master-prescription-list.repository';
const fs = require('fs');

@Injectable()
export class PrescriptionMasterApiService {
  private readonly logger = new Logger(PrescriptionMasterApiService.name);
  constructor(
    @InjectRepository(PrescriptionImageDetailsRepository)
    @InjectRepository(MasterPrescriptionListRepository)
    private readonly prescriptionImageDetailsRepository: PrescriptionImageDetailsRepository,
    private readonly masterPrescriptionListRepository: MasterPrescriptionListRepository,
  ) {
  }

  async create_prescription(CreatePrescriptionMasterApiDto: CreatePrescriptionMasterApiDto[]) : Promise <any>{
    return new Promise(async (resolve, reject) => {
      this.logger.log('Adding New Prescription');
      try{
        const promotionId = 0;
        const apiData = CreatePrescriptionMasterApiDto[0];
        
        const insertData = {
          "professional_id" : apiData.professional_id !== undefined ? Number(apiData.professional_id) : null,
          "created_by" : apiData.created_by !== undefined ? Number(apiData.created_by) : null,
          "prescription_image_count" : (apiData.prescription_image_data !== undefined && apiData.prescription_image_data.length > 0) ? apiData.prescription_image_data.length : 0
        };

        const insertLog = await this.masterPrescriptionListRepository.insert(insertData);
        const image_path = 'storage/uploads/assets/images/prescription/';
        const base64_image = await this.base64_to_image(apiData.prescription_image_data, image_path, insertLog.identifiers[0].id, apiData.created_by);
  
        resolve ((base64_image == true && insertLog.identifiers[0].id > 0) ? true : false);
      } catch(errror){
        reject (new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async byProfessionalPrescriptionSummary() : Promise <any>{
    return new Promise(async (resolve, reject) => {
      this.logger.log('Returning by Professional Prescription Summary');
      try{
          const promotionInfo = await this.masterPrescriptionListRepository
            .createQueryBuilder('Prescription')    
            .select([
              'professionalInfo.category_id AS professional_category_id',
              'Prescription.professional_id AS professional_id',
              'professionalInfo.name AS professional_name',
              'professionalInfo.designation AS designation',
              'professionalInfo.department AS department',
              'professionalInfo.organization AS organization',
              'SUM(Prescription.prescription_image_count) AS prescription_image_count'
            ])
            .innerJoin('ms_professional_list', 'professionalInfo', '`professionalInfo`.`id` = `Prescription`.`professional_id`')
            .where("Prescription.status = :status", { status: 1 })
            .groupBy('Prescription.professional_id')
            .orderBy('Prescription.professional_id', 'DESC')
            .getRawMany();

          if (!promotionInfo) {
            reject (new NotFoundException('Prescription List not found.'));
          }
          resolve (promotionInfo);
      } catch(errror){
        reject (new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async byProfessionalPrescriptionImageList(params) : Promise <any>{
    return new Promise(async (resolve, reject) => {
      this.logger.log('Returning by Professional All Prescription Image List');
      try{
        let {professional_id, limit} = params;
        const dateRange = await this.calculateDateRange(limit);
        const prescriptionImageList = await this.masterPrescriptionListRepository
            .createQueryBuilder('Prescription')    
            .select([
              'PrescriptionImage.id AS image_id',
              'Prescription.professional_id AS professional_id',
              'PrescriptionImage.image_path AS image_path'
            ])
            .innerJoin('ms_prescription_image_details', 'PrescriptionImage', '`PrescriptionImage`.`prescription_id` = `Prescription`.`id`')
            .where("Prescription.status = :status", { status: 1 })
            .where("Prescription.professional_id = :professional_id", { professional_id: professional_id })
            .where("PrescriptionImage.status = :status", { status: 1 })
            .andWhere(`DATE(Prescription.created) BETWEEN '${dateRange.start_date}' AND '${dateRange.last_date}'`)
            .orderBy('Prescription.professional_id', 'DESC')
            .getRawMany();

          if (!prescriptionImageList) {
            reject (new NotFoundException('Prescription Image List not found.'));
          }
          resolve (prescriptionImageList);
      } catch(errror){
        reject (new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async base64_to_image(base64Data: string[], image_path: string, prescription_id: number, created_by: number): Promise<any>{
    return new Promise(async (resolve, reject) => {
      try {
        let count = 0;
        const currentdate = new Date();
        const deviceDate = currentdate.getFullYear() + "-" + ('0' + (currentdate.getMonth() + 1)).slice(-2) + "-" + ('0' + currentdate.getDate()).slice(-2);
        const path = image_path + deviceDate + '/' + prescription_id + '/';
        if (!fs.existsSync('../' + path)){
          fs.mkdirSync('../' + path, { recursive: true });
        }
        let imageLog = [];
        base64Data.map(imageData => {
          const base64ImageData = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
          const image_path_and_name = path + (++count) + '.jpg';
          imageLog.push({prescription_id : prescription_id, image_path : image_path_and_name, created_by: created_by});
          require('fs').writeFile('../' + image_path_and_name, base64ImageData, 'base64', function(err) {
            if(err == 'null') return true;
            else return err;
          });
        });
        await this.prescriptionImageDetailsRepository.insert(imageLog);
        resolve (true);
      } catch (error) {
        reject (false);
      }
    });
  }

  async calculateDateRange(limit: string){
    try {
      const currentdate = new Date();
      let firstday: Date, lastday: Date, firstDayRange: string, lastDayRange: string;
      if(limit == 'all'){
        firstday = await this.getFirstDayOfYear(2022);
        lastday = currentdate;
      }
      else if(limit == 'week'){
        firstday = new Date(currentdate.setDate(currentdate.getDate() - currentdate.getDay()));
        lastday = new Date(currentdate.setDate(currentdate.getDate() - currentdate.getDay()+6));
      }
      else if(limit == 'month'){
        firstday = new Date(currentdate.getFullYear(), currentdate.getMonth(), 1);
        lastday = new Date(currentdate.getFullYear(), currentdate.getMonth() + 1, 0);
      }
      else if(limit == 'lastmonth'){
        firstday = new Date(currentdate.getFullYear(), currentdate.getMonth() - 1, 1);
        lastday = new Date(currentdate.getFullYear(), currentdate.getMonth() - 1 + 1, 0);
      }
      firstDayRange = firstday.getFullYear() + "-" + ('0' + (firstday.getMonth() + 1)).slice(-2) + "-" + ('0' + firstday.getDate()).slice(-2);          
      lastDayRange = lastday.getFullYear() + "-" + ('0' + (lastday.getMonth() + 1)).slice(-2) + "-" + ('0' + lastday.getDate()).slice(-2);
      return {"start_date": firstDayRange, "last_date" : lastDayRange};
    } catch(errror){
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  async getFirstDayOfYear(year: number) {
    return new Date(year, 0, 1);
  }

}
