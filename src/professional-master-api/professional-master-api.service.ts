import { HttpException, HttpStatus, Injectable, Logger, NotFoundException} from '@nestjs/common';
import { CreateProfessionalMasterApiDto, GetAllProfessionalFilterDto } from './dto/create-professional-master-api.dto';
import { UpdateProfessionalMasterApiDto, ProfessionalStatusUpdateDto } from './dto/update-professional-master-api.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GlobalService } from 'src/utils/global.service';
import { MasterProfessionalListRepository } from 'src/database_table/repository/master-professional-list.repository';
import { ProfessionalCategoryRepository } from 'src/database_table/repository/ms_professional_category.repository';
import { ProfessionalPresenceDetailsRepository } from 'src/database_table/repository/ms_professional_presence_details.repository';
const fs = require('fs');

@Injectable()
export class ProfessionalMasterApiService {
  private readonly logger = new Logger(ProfessionalMasterApiService.name);
  constructor(    
    @InjectRepository(MasterProfessionalListRepository)
    @InjectRepository(ProfessionalCategoryRepository)
    @InjectRepository(ProfessionalPresenceDetailsRepository)
    private readonly masterProfessionalListRepository: MasterProfessionalListRepository,
    private readonly professionalCategoryRepository: ProfessionalCategoryRepository,
    private readonly professionalPresenceDetailsRepository: ProfessionalPresenceDetailsRepository
  ) {
  }

  async professionalCategoryList() {
    this.logger.log('Returning all Professional Category');
    try{
        const category = await this.professionalCategoryRepository
          .createQueryBuilder('Category')    
          .select([
            'Category.id AS category_id',
            'Category.name AS category_name',
            'Category.name_bn AS category_name_bn',
            'Category.keyword as category_keyword',
            'Category.prescription_status as prescription_status'
          ])
          .where("Category.status = :status", { status: 1 })
          .getRawMany();

        if (!category) {
          throw new NotFoundException('Category not found.');
        }        
        return category;
    } catch(errror){
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  async create_professional(createProfessionalMasterApiDto: CreateProfessionalMasterApiDto) {
    this.logger.log('Adding New Professionals');
    try{
      const professionalId = await this.prepareProfessionalId(Number(createProfessionalMasterApiDto.category_id));
      const apiData = {...createProfessionalMasterApiDto};
      const image_path = 'public/assets/images/professionals/';
      const base64_image = await this.base64_to_image(apiData.image_data, image_path, professionalId);
      const insertData = {
        "professional_id" : String(professionalId),
        "category_id" : apiData.category_id !== undefined ? Number(apiData.category_id) : null,
        "name" : apiData.name !== undefined ? String(apiData.name) : null,
        "designation" : apiData.designation !== undefined ? String(apiData.designation) : null,
        "department" : apiData.department !== undefined ? String(apiData.department) : null,
        "organization" : apiData.organization !== undefined ? String(apiData.organization) : null,
        "contact_person" : apiData.contact_person !== undefined ? String(apiData.contact_person) : null,
        "mobile_number" : apiData.mobile_number !== undefined ? String(apiData.mobile_number) : null,
        "academic_background" : apiData.academic_background !== undefined ? String(apiData.academic_background) : null,        
        "visit_fee" : apiData.visit_fee !== undefined ? Number(apiData.visit_fee) : null,
        "calendar_type" : apiData.calendar_type !== undefined ? String(apiData.calendar_type) : null,
        "chamber" : apiData.chamber !== undefined ? String(apiData.chamber) : null,
        "territory_id" : apiData.territory_id !== undefined ? Number(apiData.territory_id) : null,
        "dep_id" : apiData.dep_id !== undefined ? Number(apiData.dep_id) : null,
        "route_id" : apiData.route_id !== undefined ? Number(apiData.route_id) : null,
        "contract_value" : apiData.contract_value !== undefined ? Number(apiData.contract_value) : null,
        "contract_tenure" : apiData.contract_tenure !== undefined ? Number(apiData.contract_tenure) : null,
        "patients_per_week" : apiData.patients_per_week !== undefined ? Number(apiData.patients_per_week) : null,
        "baby_food_prescriptions" : apiData.baby_food_prescriptions !== undefined ? Number(apiData.baby_food_prescriptions) : null,
        "prescription_for_mother_smile" : apiData.prescription_for_mother_smile !== undefined ? Number(apiData.prescription_for_mother_smile) : null,
        "image_path" : String(image_path + professionalId + '.jpg'),
        "request_date": new Date(),
        "comments" : apiData.comments !== undefined ? String(apiData.comments) : null,
        "activation_status" : 0, // activation_status 0 = Inactive Professional; 1 = Active Professional; 2 = Deactivate Professional
        "request_status" : 3, // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
        "created_by" : GlobalService.userId !== undefined ? Number(GlobalService.userId) : null,
      };

      const insertLog = await this.masterProfessionalListRepository.insert(insertData);

      if(apiData.visiting_schedule !== undefined && apiData.visiting_schedule.length > 0){
        const scheduleData = [];
        apiData.visiting_schedule.map(details => {
          if(apiData.calendar_type == 'weekly'){
            scheduleData.push({professional_id : insertLog.identifiers[0].id, presence_weekday: details['day'], presence_month_date: null, visiting_time: details['time'], created_by: apiData.created_by});
          } else if (apiData.calendar_type == 'monthly'){
            scheduleData.push({professional_id : insertLog.identifiers[0].id, presence_weekday: null, presence_month_date: details['day'], visiting_time: details['time'], created_by: apiData.created_by});
          }
        });
        await this.professionalPresenceDetailsRepository.insert(scheduleData);
      }      
      return (insertLog.identifiers[0].id > 0) ? true : false;
    } catch(errror){
       throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    } 
  }

  async professionalList(getAllProfessionalFilterDto: GetAllProfessionalFilterDto) {
    this.logger.log('Returning all Professionals');
    try{
      const searchFilter = { ... getAllProfessionalFilterDto};  
      const professionalList = await this.masterProfessionalListRepository
          .createQueryBuilder('Professional')    
          .select([
            'Professional.id AS id',
            'Professional.professional_id AS professional_id',            
            'Professional.category_id AS category_id',
            "Category.name AS category_name",
            'Professional.name AS professional_name',
            'Professional.designation AS designation',
            'Professional.department AS department',
            // 'DivisionInfo.id AS division_id',
            'DivisionInfo.slug AS division_name',
            // 'AreaInfo.id AS area_id',
            'AreaInfo.slug AS area_name',
            // 'TerritoryInfo.id AS territory_id',
            'TerritoryInfo.slug AS territory_name',
            // 'section_mapping.dep_id AS point_id',
            'DistributorPoint.name AS point_name',
            'Professional.academic_background AS academic_background',
            'Professional.visit_fee AS visit_fee'
          ])
          // activation_status 0 = Inactive Professional; 1 = Active Professional; 2 = Deactivate Professional
          .addSelect(`CASE
              WHEN Professional.activation_status = 0 THEN 'Inactive'
              WHEN Professional.activation_status = 1 THEN 'Active'
              WHEN Professional.activation_status = 2 THEN 'Deactivate'
            END`, 'activation_status')
          // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
          .addSelect(`CASE
              WHEN Professional.request_status = 0 THEN 'Decline'
              WHEN Professional.request_status = 1 THEN 'Approved'
              WHEN Professional.request_status = 2 THEN 'Edit'
              WHEN Professional.request_status = 3 THEN 'New'
            END`, 'request_status')
          .innerJoin('ms_professional_category', 'Category', '`Professional`.`category_id` = `Category`.`id`')
          // to fetch Point
          .innerJoin('master_dep', 'DistributorPoint', '`Professional`.`dep_id` = `DistributorPoint`.`id`')
          // to fetch region | division
          .innerJoin('master_dep_location_mapping', 'DivisionMapping', '`Professional`.`dep_id` = `DivisionMapping`.`dep_id` AND `DivisionMapping`.`location_type` = :division_location_type', { division_location_type: 18 })
          .innerJoin('master_locations', 'DivisionInfo', '`DivisionMapping`.`location_id` = `DivisionInfo`.`id`')
          // to fetch area
          .innerJoin('master_dep_location_mapping', 'AreaMapping', '`Professional`.`dep_id` = `AreaMapping`.`dep_id` AND `AreaMapping`.`location_type` = :area_location_type', { area_location_type: 19 })
          .innerJoin('master_locations', 'AreaInfo', '`AreaMapping`.`location_id` = `AreaInfo`.`id`')
          // to fetch territory
          .innerJoin('master_dep_location_mapping', 'TerritoryMapping', '`Professional`.`dep_id` = `TerritoryMapping`.`dep_id` AND `TerritoryMapping`.`location_type` = :territory_location_type', { territory_location_type: 20 })
          .innerJoin('master_locations', 'TerritoryInfo', '`TerritoryMapping`.`location_id` = `TerritoryInfo`.`id`')
          // .where("Professional.status = :status", { status: 1 })
          // .andWhere("Professional.territory_id IN(:territory_ids)", { territory_ids: [1] })
          // .andWhere("Professional.route_id IN(:route_ids)", { route_ids: [1] })
          .andWhere(
            (((searchFilter.point_ids).length != 0) ? professionalList => professionalList.where("Professional.dep_id IN (:point_ids)", { point_ids: searchFilter.point_ids }) : '')
          )
          .orderBy('Professional.id', 'DESC')
          .getRawMany();

        if (!professionalList) {
          throw new NotFoundException('Professional not found.');
        }        
        return professionalList;
    } catch(errror){
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  async professionalDetailsById(professional_id: number) {
    this.logger.log('Returning all Professionals');
    try{
      const professionalDetails = await this.masterProfessionalListRepository
            .createQueryBuilder('Professional')
            .select([
              'Professional.id AS id',
              'Professional.professional_id AS professional_id',            
              'Professional.category_id AS category_id',
              "Category.name AS category_name",
              'Professional.name AS professional_name',
              'Professional.designation AS designation',
              'Professional.department AS department',
              'Professional.organization AS organization',
              'Professional.contact_person AS contact_person',
              'Professional.mobile_number AS mobile_number',
              'Professional.academic_background AS academic_background',
              'Professional.visit_fee AS visit_fee',
              'Professional.calendar_type AS calendar_type',
              'Professional.chamber AS chamber',
              // 'DivisionInfo.id AS division_id',
              'DivisionInfo.slug AS division_name',
              // 'AreaInfo.id AS area_id',
              'AreaInfo.slug AS area_name',
              // 'TerritoryInfo.id AS territory_id',
              'TerritoryInfo.slug AS territory_name',
              // 'section_mapping.dep_id AS point_id',
              'DistributorPoint.name AS point_name',
              'Professional.contract_value AS contract_value',
              'Professional.contract_tenure AS contract_tenure',
              'Professional.patients_per_week AS patients_per_week',
              'Professional.baby_food_prescriptions AS baby_food_prescriptions',
              'Professional.prescription_for_mother_smile AS prescription_for_mother_smile',
              'Professional.image_path AS image_path',
              'Professional.comments AS comments'
            ])
            // activation_status 0 = Inactive Professional; 1 = Active Professional; 2 = Deactivate Professional
            .addSelect(`CASE
                WHEN Professional.activation_status = 0 THEN 'Inactive'
                WHEN Professional.activation_status = 1 THEN 'Active'
                WHEN Professional.activation_status = 2 THEN 'Deactivate'
              END`, 'activation_status')
            // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
            .addSelect(`CASE
                WHEN Professional.request_status = 0 THEN 'Decline'
                WHEN Professional.request_status = 1 THEN 'Approved'
                WHEN Professional.request_status = 2 THEN 'Edit'
                WHEN Professional.request_status = 3 THEN 'New'
              END`, 'request_status')
            .innerJoin('ms_professional_category', 'Category', '`Professional`.`category_id` = `Category`.`id`')
            // to fetch Point
            .innerJoin('master_dep', 'DistributorPoint', '`Professional`.`dep_id` = `DistributorPoint`.`id`')
            // to fetch region | division
            .innerJoin('master_dep_location_mapping', 'DivisionMapping', '`Professional`.`dep_id` = `DivisionMapping`.`dep_id` AND `DivisionMapping`.`location_type` = :division_location_type', { division_location_type: 18 })
            .innerJoin('master_locations', 'DivisionInfo', '`DivisionMapping`.`location_id` = `DivisionInfo`.`id`')
            // to fetch area
            .innerJoin('master_dep_location_mapping', 'AreaMapping', '`Professional`.`dep_id` = `AreaMapping`.`dep_id` AND `AreaMapping`.`location_type` = :area_location_type', { area_location_type: 19 })
            .innerJoin('master_locations', 'AreaInfo', '`AreaMapping`.`location_id` = `AreaInfo`.`id`')
            // to fetch territory
            .innerJoin('master_dep_location_mapping', 'TerritoryMapping', '`Professional`.`dep_id` = `TerritoryMapping`.`dep_id` AND `TerritoryMapping`.`location_type` = :territory_location_type', { territory_location_type: 20 })
            .innerJoin('master_locations', 'TerritoryInfo', '`TerritoryMapping`.`location_id` = `TerritoryInfo`.`id`')
            .where("Professional.id = :professional_id", { professional_id: professional_id })
            .getRawMany();
      
      if (!professionalDetails) {
        throw new NotFoundException('Professional Details not found.');
      } 

      const presenceDetails = await this.professionalPresenceDetailsRepository
            .createQueryBuilder('Presence')    
            .select([
              'Presence.presence_weekday AS presence_weekday',
              'Presence.presence_month_date AS presence_month_date',
              'Presence.visiting_time AS visiting_time'
            ])
            .where("Presence.professional_id = :professional_id", { professional_id: professional_id })
            .where("Presence.status = :status", { status: 1 })
            .getRawMany();

      if (presenceDetails) {
        const visiting_schedule = [];
        presenceDetails.map(details => {
          if(professionalDetails[0].calendar_type == 'weekly'){
            visiting_schedule.push({day : details.presence_weekday, time : details.visiting_time});
          } else if(professionalDetails[0].calendar_type == 'monthly'){
            visiting_schedule.push({day : details.presence_month_date, time : details.visiting_time});
          }
        });
        professionalDetails[0]['visiting_schedule'] = visiting_schedule;
      }
            
      return professionalDetails;
    } catch(errror){
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  async professionalDetailsByProfessionalId(professional_id: string) {
    this.logger.log('Returning all Professionals');
    try{
      const professionalDetails = await this.masterProfessionalListRepository
            .createQueryBuilder('Professional')
            .select([
              'Professional.id AS id',
              'Professional.professional_id AS professional_id',            
              'Professional.category_id AS category_id',
              "Category.name AS category_name",
              'Professional.name AS professional_name',
              'Professional.designation AS designation',
              'Professional.department AS department',
              'Professional.organization AS organization',
              'Professional.contact_person AS contact_person',
              'Professional.mobile_number AS mobile_number',
              'Professional.academic_background AS academic_background',
              'Professional.visit_fee AS visit_fee',
              'Professional.calendar_type AS calendar_type',
              'Professional.chamber AS chamber',
              // 'DivisionInfo.id AS division_id',
              'DivisionInfo.slug AS division_name',
              // 'AreaInfo.id AS area_id',
              'AreaInfo.slug AS area_name',
              // 'TerritoryInfo.id AS territory_id',
              'TerritoryInfo.slug AS territory_name',
              // 'section_mapping.dep_id AS point_id',
              'DistributorPoint.name AS point_name',
              'Professional.contract_value AS contract_value',
              'Professional.contract_tenure AS contract_tenure',
              'Professional.patients_per_week AS patients_per_week',
              'Professional.baby_food_prescriptions AS baby_food_prescriptions',
              'Professional.prescription_for_mother_smile AS prescription_for_mother_smile',
              'Professional.image_path AS image_path',
              'Professional.comments AS comments'
            ])
            // activation_status 0 = Inactive Professional; 1 = Active Professional; 2 = Deactivate Professional
            .addSelect(`CASE
                WHEN Professional.activation_status = 0 THEN 'Inactive'
                WHEN Professional.activation_status = 1 THEN 'Active'
                WHEN Professional.activation_status = 2 THEN 'Deactivate'
              END`, 'activation_status')
            // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
            .addSelect(`CASE
                WHEN Professional.request_status = 0 THEN 'Decline'
                WHEN Professional.request_status = 1 THEN 'Approved'
                WHEN Professional.request_status = 2 THEN 'Edit'
                WHEN Professional.request_status = 3 THEN 'New'
              END`, 'request_status')
            .innerJoin('ms_professional_category', 'Category', '`Professional`.`category_id` = `Category`.`id`')
            // to fetch Point
            .innerJoin('master_dep', 'DistributorPoint', '`Professional`.`dep_id` = `DistributorPoint`.`id`')
            // to fetch region | division
            .innerJoin('master_dep_location_mapping', 'DivisionMapping', '`Professional`.`dep_id` = `DivisionMapping`.`dep_id` AND `DivisionMapping`.`location_type` = :division_location_type', { division_location_type: 18 })
            .innerJoin('master_locations', 'DivisionInfo', '`DivisionMapping`.`location_id` = `DivisionInfo`.`id`')
            // to fetch area
            .innerJoin('master_dep_location_mapping', 'AreaMapping', '`Professional`.`dep_id` = `AreaMapping`.`dep_id` AND `AreaMapping`.`location_type` = :area_location_type', { area_location_type: 19 })
            .innerJoin('master_locations', 'AreaInfo', '`AreaMapping`.`location_id` = `AreaInfo`.`id`')
            // to fetch territory
            .innerJoin('master_dep_location_mapping', 'TerritoryMapping', '`Professional`.`dep_id` = `TerritoryMapping`.`dep_id` AND `TerritoryMapping`.`location_type` = :territory_location_type', { territory_location_type: 20 })
            .innerJoin('master_locations', 'TerritoryInfo', '`TerritoryMapping`.`location_id` = `TerritoryInfo`.`id`')
            .where("Professional.professional_id = :professional_id", { professional_id: professional_id })
            .getRawMany();
      
      if (!professionalDetails) {
        throw new NotFoundException('Professional Details not found.');
      } 

      const presenceDetails = await this.professionalPresenceDetailsRepository
            .createQueryBuilder('Presence')    
            .select([
              'Presence.presence_weekday AS presence_weekday',
              'Presence.presence_month_date AS presence_month_date',
              'Presence.visiting_time AS visiting_time'
            ])
            .where("Presence.professional_id = :professional_id", { professional_id: professional_id })
            .where("Presence.status = :status", { status: 1 })
            .getRawMany();

      if (presenceDetails) {
        const visiting_schedule = [];
        presenceDetails.map(details => {
          if(professionalDetails[0].calendar_type == 'weekly'){
            visiting_schedule.push({day : details.presence_weekday, time : details.visiting_time});
          } else if(professionalDetails[0].calendar_type == 'monthly'){
            visiting_schedule.push({day : details.presence_month_date, time : details.visiting_time});
          }
        });
        professionalDetails[0]['visiting_schedule'] = visiting_schedule;
      }
            
      return professionalDetails;
    } catch(errror){
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  async updateProfessional(id: number, updateProfessionalMasterApiDto: UpdateProfessionalMasterApiDto[]) {
    this.logger.log('Updating Professional Details');
    try{
      const apiData = updateProfessionalMasterApiDto[0];
      const image_path = 'public/assets/images/professionals/';
      const base64_image = await this.base64_to_image(apiData.image_data, image_path, apiData.professional_id);
      const updateProfessional = await this.masterProfessionalListRepository
        .createQueryBuilder()
        .update('ms_professional_list')
        .set({
          category_id : apiData.category_id !== undefined ? Number(apiData.category_id) : null,
          name : apiData.name !== undefined ? String(apiData.name) : null,
          designation : apiData.designation !== undefined ? String(apiData.designation) : null,
          department : apiData.department !== undefined ? String(apiData.department) : null,
          organization : apiData.organization !== undefined ? String(apiData.organization) : null,
          contact_person : apiData.contact_person !== undefined ? String(apiData.contact_person) : null,
          mobile_number : apiData.mobile_number !== undefined ? String(apiData.mobile_number) : null,
          academic_background : apiData.academic_background !== undefined ? String(apiData.academic_background) : null,        
          visit_fee : apiData.visit_fee !== undefined ? Number(apiData.visit_fee) : null,
          calendar_type : apiData.calendar_type !== undefined ? String(apiData.calendar_type) : null,
          chamber : apiData.chamber !== undefined ? String(apiData.chamber) : null,
          territory_id : apiData.territory_id !== undefined ? Number(apiData.territory_id) : null,
          route_id : apiData.route_id !== undefined ? Number(apiData.route_id) : null,
          contract_value : apiData.contract_value !== undefined ? Number(apiData.contract_value) : null,
          contract_tenure : apiData.contract_tenure !== undefined ? Number(apiData.contract_tenure) : null,
          patients_per_week : apiData.patients_per_week !== undefined ? Number(apiData.patients_per_week) : null,
          baby_food_prescriptions : apiData.baby_food_prescriptions !== undefined ? Number(apiData.baby_food_prescriptions) : null,
          prescription_for_mother_smile : apiData.prescription_for_mother_smile !== undefined ? Number(apiData.prescription_for_mother_smile) : null,
          comments : apiData.comments !== undefined ? String(apiData.comments) : null,
          updated_by : apiData.created_by !== undefined ? Number(apiData.created_by) : null,
        })
        .where("id = :id", { id: id })
        .execute();
      
        if(apiData.visiting_schedule !== undefined && apiData.visiting_schedule.length > 0){
          await this.professionalPresenceDetailsRepository
            .createQueryBuilder()
            .delete()
            .from('ms_professional_presence_details')
            .where("professional_id = :id", { id: id })
            .execute();
          const scheduleData = [];
          apiData.visiting_schedule.map(details => {
            if(apiData.calendar_type == 'weekly'){
              scheduleData.push({professional_id : id, presence_weekday: details['day'], presence_month_date: null, visiting_time: details['time'], created_by: apiData.updated_by});
            } else if (apiData.calendar_type == 'monthly'){
              scheduleData.push({professional_id : id, presence_weekday: null, presence_month_date: details['day'], visiting_time: details['time'], created_by: apiData.updated_by});
            }
          });
          await this.professionalPresenceDetailsRepository.insert(scheduleData);
        } 

      return (updateProfessional.affected > 0) ? true : false;
    } catch(errror){
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  async professionalUpdateAsApproved(professionalStatusUpdateDto: ProfessionalStatusUpdateDto) {
    this.logger.log('Updating Professional Status');
    // activation_status 0 = Inactive Professional; 1 = Active Professional; 2 = Deactivate Professional
    // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
    try{
      const payload = { ... professionalStatusUpdateDto};
      const updateProfessional = await this.masterProfessionalListRepository
        .createQueryBuilder()
        .update('ms_professional_list')
        .set({
          activation_status : 1,
          request_status : 1,
          activation_date : new Date(),
          updated_by : GlobalService.userId,
        })
        .andWhere("ms_professional_list.id IN(:professional_ids)", { professional_ids : payload.professional_ids })
        .andWhere("ms_professional_list.activation_status IN(:activation_status)", { activation_status : [0, 2] })
        // .andWhere("ms_professional_list.request_status IN(:activation_status)", { activation_status : [0, 1, 2, 3] })
        .execute();

      return (updateProfessional.affected > 0) ? true : false;
    } catch(errror){
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  async professionalUpdateAsDecline(professionalStatusUpdateDto: ProfessionalStatusUpdateDto) {
    this.logger.log('Updating Professional Status');
    // activation_status 0 = Inactive Professional; 1 = Active Professional; 2 = Deactivate Professional
    // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
    try{
      const payload = { ... professionalStatusUpdateDto};
      const updateProfessional = await this.masterProfessionalListRepository
        .createQueryBuilder()
        .update('ms_professional_list')
        .set({
          activation_status : 0,
          request_status : 0,
          activation_date : new Date(),
          updated_by : GlobalService.userId,
        })
        .andWhere("ms_professional_list.id IN(:professional_ids)", { professional_ids : payload.professional_ids })
        .andWhere("ms_professional_list.activation_status IN(:activation_status)", { activation_status : [0] })
        // .andWhere("ms_professional_list.request_status IN(:activation_status)", { activation_status : [2, 3] })
        .execute();

      return (updateProfessional.affected > 0) ? true : false;
    } catch(errror){
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  async professionalUpdateAsDeactivate(professionalStatusUpdateDto: ProfessionalStatusUpdateDto) {
    this.logger.log('Updating Professional Status');
    // activation_status 0 = Inactive Professional; 1 = Active Professional; 2 = Deactivate Professional
    // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
    try{
      const payload = { ... professionalStatusUpdateDto};
      const updateProfessional = await this.masterProfessionalListRepository
        .createQueryBuilder()
        .update('ms_professional_list')
        .set({
          activation_status : 2,
          activation_date : new Date(),
          updated_by : GlobalService.userId,
        })
        .andWhere("ms_professional_list.id IN(:professional_ids)", { professional_ids : payload.professional_ids })
        .andWhere("ms_professional_list.activation_status IN(:activation_status)", { activation_status : [1] })
        // .andWhere("ms_professional_list.request_status IN(:activation_status)", { activation_status : [1] })
        .execute();

      return (updateProfessional.affected > 0) ? true : false;
    } catch(errror){
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  async prepareProfessionalId (category_id: number) {
    try {
      const professionalCategory = await this.professionalCategoryRepository.findOne({
        where:{
          id : category_id,
          status : 1
        }
      });
      const professionalList = await this.masterProfessionalListRepository.find();    
      const professional_id = professionalCategory.id_creation + await this.addingExtraZeros(String(professionalList.length + 1), 5);
      return professional_id;
    } catch (error) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  async addingExtraZeros (str: string, max: number) {
    try {
      str = str.toString();
      return str.length < max ? await this.addingExtraZeros("0" + str, max) : str;
    } catch (error) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  async base64_to_image (base64Data: string, image_path: string, image_name: string) {
    base64Data = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");
    return new Promise(async (resolve, reject) => {
      try {
        if (!fs.existsSync(image_path)){
          fs.mkdirSync(image_path, { recursive: true });
        }
        const image_path_and_name = image_path + image_name + '.jpg';
        require('fs').writeFile(image_path_and_name, base64Data, 'base64', function(err) {
          if(err == 'null') return true;
          else return err;
        });
        resolve (true);
      } catch (error) {
        reject (false);
      }
    })
  }

}
