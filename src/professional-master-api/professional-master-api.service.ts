import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterProfessionalListRepository } from 'src/database_table/repository/master-professional-list.repository';
import { ProfessionalCategoryRepository } from 'src/database_table/repository/ms_professional_category.repository';
import { ProfessionalPresenceDetailsRepository } from 'src/database_table/repository/ms_professional_presence_details.repository';
import { Binary } from 'typeorm';
import { CreateProfessionalMasterApiDto, GetAllProfessionalFilterDto } from './dto/create-professional-master-api.dto';
import { ProfessionalStatusUpdateDto, UpdateProfessionalMasterApiDto } from './dto/update-professional-master-api.dto';
import { CategoryList, ProfessionalDetails, ProfessionalList } from './entities/professional-master-api.entity';
import { MasterPrescriptionListRepository } from 'src/database_table/repository/master-prescription-list.repository';
const fs = require('fs');

@Injectable()
export class ProfessionalMasterApiService {
  private readonly logger = new Logger(ProfessionalMasterApiService.name);
  constructor(
    @InjectRepository(MasterProfessionalListRepository)
    private readonly masterProfessionalListRepository: MasterProfessionalListRepository,

    @InjectRepository(ProfessionalCategoryRepository)
    private readonly professionalCategoryRepository: ProfessionalCategoryRepository,

    @InjectRepository(ProfessionalPresenceDetailsRepository)
    private readonly professionalPresenceDetailsRepository: ProfessionalPresenceDetailsRepository,

    @InjectRepository(MasterPrescriptionListRepository)
    private readonly masterPrescriptionListRepository: MasterPrescriptionListRepository
  ) {
  }

  async professionalCategoryList(): Promise<CategoryList[]> {
    return new Promise(async (resolve, reject) => {
      try {
        this.logger.log('Returning all Professional Category');
        const category: CategoryList[] = await this.professionalCategoryRepository
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
          reject(new NotFoundException('Category not found.'));
        }
        resolve(category);
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async create_professional(createProfessionalMasterApiDto: CreateProfessionalMasterApiDto[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.logger.log('Adding New Professionals');
      try {
        const image_path = '/storage/uploads/assets/images/professionals/';
        if (Array.isArray(createProfessionalMasterApiDto)) {
          if (createProfessionalMasterApiDto.length != 0) {
            for (const professional of createProfessionalMasterApiDto) {
              // check if have or not
              const existing = await this.masterProfessionalListRepository.findOne({
                professional_id: professional.professional_id
              })
              if (existing) {
                const { visiting_schedule, image_data = null, ...rest } = professional

                if (image_data) {
                  await this.base64_to_image(professional.image_data, image_path, professional.professional_id);
                }
                await this.masterProfessionalListRepository
                  .createQueryBuilder()
                  .update('ms_professional_list')
                  .set({
                    dob: rest.dob,
                    category_id: rest.category_id,
                    name: rest.name,
                    designation: rest.designation,
                    department: rest.department,
                    organization: rest.organization,
                    mobile_number: rest.mobile_number,
                    academic_background: rest.academic_background,
                    visit_fee: Number(rest.visit_fee),
                    calendar_type: rest.calendar_type,
                    chamber: rest.chamber,
                    territory_id: Number(rest.territory_id),
                    dep_id: Number(rest.dep_id),
                    route_id: Number(rest.route_id),
                    contract_value: Number(rest.contract_value),
                    contract_tenure: Number(rest.contract_tenure),
                    patients_per_week: Number(rest.patients_per_week),
                    baby_food_prescriptions: Number(rest.baby_food_prescriptions),
                    prescription_for_mother_smile: Number(rest.prescription_for_mother_smile),
                    comments: rest.comments,
                    updated_by: rest.created_by
                  })
                  .where("professional_id = :professional_id", { professional_id: professional.professional_id })
                  .execute();

                await this.professionalPresenceDetailsRepository
                  .createQueryBuilder()
                  .delete()
                  .from('ms_professional_presence_details')
                  .where("professional_id = :id", { id: existing.id })
                  .execute();

                if (visiting_schedule && visiting_schedule.length > 0) {
                  let data: any[] = [];
                  for (let i = 0; i < visiting_schedule.length; i++) {
                    let details = visiting_schedule[i];
                    if (rest.calendar_type.toLowerCase() == 'weekly') {
                      data.push({ professional_id: existing.id, presence_weekday: details['day'], presence_month_date: null, visiting_time: details['time'], created_by: rest.created_by });
                    } else if (rest.calendar_type.toLowerCase() == 'monthly') {
                      data.push({ professional_id: existing.id, presence_weekday: null, presence_month_date: details['day'], visiting_time: details['time'], created_by: rest.created_by });
                    }

                  }
                  await this.professionalPresenceDetailsRepository.insert(data)
                }
              }
              else {
                let base64_image: Binary = await this.base64_to_image(professional.image_data, image_path, professional.professional_id);
                if (base64_image) {
                  let insertData: object = {
                    "professional_id": String(professional.professional_id),
                    "category_id": professional.category_id !== undefined ? Number(professional.category_id) : null,
                    "name": professional.name !== undefined ? String(professional.name) : null,
                    "designation": professional.designation !== undefined ? String(professional.designation) : null,
                    "dob": professional.dob !== undefined ? String(professional.dob) : null,
                    "department": professional.department !== undefined ? String(professional.department) : null,
                    "organization": professional.organization !== undefined ? String(professional.organization) : null,
                    "contact_person": professional.contact_person !== undefined ? String(professional.contact_person) : null,
                    "mobile_number": professional.mobile_number !== undefined ? String(professional.mobile_number) : null,
                    "academic_background": professional.academic_background !== undefined ? String(professional.academic_background) : null,
                    "visit_fee": professional.visit_fee !== undefined ? Number(professional.visit_fee) : null,
                    "calendar_type": professional.calendar_type !== undefined ? String(professional.calendar_type) : null,
                    "chamber": professional.chamber !== undefined ? String(professional.chamber) : null,
                    "territory_id": professional.territory_id !== undefined ? Number(professional.territory_id) : null,
                    "dep_id": professional.dep_id !== undefined ? Number(professional.dep_id) : null,
                    "route_id": professional.route_id !== undefined ? Number(professional.route_id) : null,
                    "contract_value": professional.contract_value !== undefined ? Number(professional.contract_value) : null,
                    "contract_tenure": professional.contract_tenure !== undefined ? Number(professional.contract_tenure) : null,
                    "patients_per_week": professional.patients_per_week !== undefined ? Number(professional.patients_per_week) : null,
                    "baby_food_prescriptions": professional.baby_food_prescriptions !== undefined ? Number(professional.baby_food_prescriptions) : null,
                    "prescription_for_mother_smile": professional.prescription_for_mother_smile !== undefined ? Number(professional.prescription_for_mother_smile) : null,
                    "image_path": String(image_path + professional.professional_id + '.jpg'),
                    "request_date": new Date(),
                    "comments": professional.comments !== undefined ? String(professional.comments) : null,
                    "activation_status": 0,  // activation_status 0 = Inactive Professional; 1 = Active Professional; 2 = Deactivate Professional
                    "request_status": 3,     // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
                    "created_by": professional.created_by !== undefined ? Number(professional.created_by) : null,
                  };
                  let insertLog = await this.masterProfessionalListRepository.insert(insertData);
                  if (professional.visiting_schedule !== undefined && professional.visiting_schedule.length > 0) {
                    let scheduleData = [];
                    professional.visiting_schedule.map(details => {
                      if (professional.calendar_type.toLowerCase() == 'weekly') {
                        scheduleData.push({ professional_id: insertLog.identifiers[0].id, presence_weekday: details['day'], presence_month_date: null, visiting_time: details['time'], created_by: professional.created_by });
                      } else if (professional.calendar_type.toLowerCase() == 'monthly') {
                        scheduleData.push({ professional_id: insertLog.identifiers[0].id, presence_weekday: null, presence_month_date: details['day'], visiting_time: details['time'], created_by: professional.created_by });
                      }
                    });
                    await this.professionalPresenceDetailsRepository.insert(scheduleData);
                  }
                }
              }
            }
            resolve({ success: true, msg: 'Professional Added Successfully.' });
          } else {
            resolve({ success: false, msg: 'Professional Data Not Found.' });
          }
        } else {
          resolve({ success: false, msg: 'API is Expecting Object in Array.' });
        }
      } catch (error) {
        console.log(error);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async professionalList(getAllProfessionalFilterDto: GetAllProfessionalFilterDto): Promise<ProfessionalList[]> {
    return new Promise(async (resolve, reject) => {
      try {
        this.logger.log('Returning all Professionals');
        const searchFilter = { ...getAllProfessionalFilterDto };
        const professionalList: ProfessionalList[] = await this.masterProfessionalListRepository
          .createQueryBuilder('Professional')
          .select([
            'Professional.id AS id',
            'Professional.professional_id AS professional_id',
            'Professional.category_id AS category_id',
            "Category.name AS category_name",
            'Professional.name AS professional_name',
            'Professional.organization AS organization',
            'Professional.designation AS designation',
            'Professional.department AS department',
            'Professional.chamber AS chamber',
            // 'DivisionInfo.id AS division_id',
            'DivisionInfo.slug AS division_name',
            // 'RegionInfo.id AS region_id',
            'RegionInfo.slug AS region_name',
            // 'AreaInfo.id AS area_id',
            'AreaInfo.slug AS area_name',
            // 'TerritoryInfo.id AS territory_id',
            'TerritoryInfo.slug AS territory_name',
            // 'section_mapping.dep_id AS point_id',
            'DistributorPoint.name AS point_name',
            // 'Route.id AS route_id',
            'Route.slug AS route_name',
            'Professional.academic_background AS academic_background',
            'Professional.visit_fee AS visit_fee',
            // organization, contact no, chamber, route
            'Professional.mobile_number AS contact_no',
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
          // to fetch division
          .innerJoin('master_dep_location_mapping', 'DivisionMapping', '`Professional`.`dep_id` = `DivisionMapping`.`dep_id` AND `DivisionMapping`.`location_type` = :division_location_type', { division_location_type: 18 })
          .innerJoin('master_locations', 'DivisionInfo', '`DivisionMapping`.`location_id` = `DivisionInfo`.`id`')
          // to fetch region
          .innerJoin('master_dep_location_mapping', 'RegionMapping', '`Professional`.`dep_id` = `RegionMapping`.`dep_id` AND `RegionMapping`.`location_type` = :region_location_type', { region_location_type: 109 })
          .innerJoin('master_locations', 'RegionInfo', '`RegionMapping`.`location_id` = `RegionInfo`.`id`')
          // to fetch area
          .innerJoin('master_dep_location_mapping', 'AreaMapping', '`Professional`.`dep_id` = `AreaMapping`.`dep_id` AND `AreaMapping`.`location_type` = :area_location_type', { area_location_type: 19 })
          .innerJoin('master_locations', 'AreaInfo', '`AreaMapping`.`location_id` = `AreaInfo`.`id`')
          // to fetch territory
          .innerJoin('master_dep_location_mapping', 'TerritoryMapping', '`Professional`.`dep_id` = `TerritoryMapping`.`dep_id` AND `TerritoryMapping`.`location_type` = :territory_location_type', { territory_location_type: 20 })
          .innerJoin('master_locations', 'TerritoryInfo', '`TerritoryMapping`.`location_id` = `TerritoryInfo`.`id`')
          // to fetch route
          .innerJoin('master_routes', 'Route', '`Professional`.`route_id` = `Route`.`id`')
          // .where("Professional.activation_status = :activation_status", { activation_status: 1 })
          .andWhere(
            (((searchFilter.point_ids).length != 0) ? professionalList => professionalList.where("Professional.dep_id IN (:point_ids)", { point_ids: searchFilter.point_ids }) : '')
          )
          .orderBy('Professional.id', 'DESC')
          .getRawMany();

        if (!professionalList) {
          reject(new NotFoundException('Professional not found.'));
        }
        resolve(professionalList);
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async professionalDetailsById(professional_id: number): Promise<ProfessionalDetails[]> {
    return new Promise(async (resolve, reject) => {
      try {
        this.logger.log('Returning all Professionals');
        if (professional_id) {
          const professionalDetails: any = await this.masterProfessionalListRepository
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
              // 'RegionInfo.id AS region_id',
              'RegionInfo.slug AS region_name',
              // 'AreaInfo.id AS area_id',
              'AreaInfo.slug AS area_name',
              // 'TerritoryInfo.id AS territory_id',
              'TerritoryInfo.slug AS territory_name',
              // 'section_mapping.dep_id AS point_id',
              'DistributorPoint.name AS point_name',
              // 'Route.id AS route_id',
              'Route.slug AS route_name',
              'Professional.contract_value AS contract_value',
              'Professional.contract_tenure AS contract_tenure',
              'Professional.patients_per_week AS patients_per_week',
              'Professional.baby_food_prescriptions AS baby_food_prescriptions',
              'Professional.prescription_for_mother_smile AS prescription_for_mother_smile',
              'Professional.image_path AS image_path',
              'Professional.comments AS comments',
              'Professional.dob AS dob'
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
            // to fetch division
            .innerJoin('master_dep_location_mapping', 'DivisionMapping', '`Professional`.`dep_id` = `DivisionMapping`.`dep_id` AND `DivisionMapping`.`location_type` = :division_location_type', { division_location_type: 18 })
            .innerJoin('master_locations', 'DivisionInfo', '`DivisionMapping`.`location_id` = `DivisionInfo`.`id`')
            // to fetch region
            .innerJoin('master_dep_location_mapping', 'RegionMapping', '`Professional`.`dep_id` = `RegionMapping`.`dep_id` AND `RegionMapping`.`location_type` = :region_location_type', { region_location_type: 109 })
            .innerJoin('master_locations', 'RegionInfo', '`RegionMapping`.`location_id` = `RegionInfo`.`id`')
            // to fetch area
            .innerJoin('master_dep_location_mapping', 'AreaMapping', '`Professional`.`dep_id` = `AreaMapping`.`dep_id` AND `AreaMapping`.`location_type` = :area_location_type', { area_location_type: 19 })
            .innerJoin('master_locations', 'AreaInfo', '`AreaMapping`.`location_id` = `AreaInfo`.`id`')
            // to fetch territory
            .innerJoin('master_dep_location_mapping', 'TerritoryMapping', '`Professional`.`dep_id` = `TerritoryMapping`.`dep_id` AND `TerritoryMapping`.`location_type` = :territory_location_type', { territory_location_type: 20 })
            .innerJoin('master_locations', 'TerritoryInfo', '`TerritoryMapping`.`location_id` = `TerritoryInfo`.`id`')
            // to fetch route
            .innerJoin('master_routes', 'Route', '`Professional`.`route_id` = `Route`.`id`')
            .where("Professional.id = :professional_id", { professional_id: professional_id })
            .getRawMany();

          if (!professionalDetails) {
            reject(new NotFoundException('Professional Details not found.'));
          }

          const presenceDetails: any = await this.professionalPresenceDetailsRepository
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
            for (const details of presenceDetails) {
              if (professionalDetails[0].calendar_type == 'weekly') {
                visiting_schedule.push({ day: details.presence_weekday, time: details.visiting_time });
              } else if (professionalDetails[0].calendar_type == 'monthly') {
                visiting_schedule.push({ day: details.presence_month_date, time: details.visiting_time });
              }
            }
            professionalDetails[0]['visiting_schedule'] = visiting_schedule;
          }
          resolve(professionalDetails);
        } else {
          resolve([]);
        }
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async professionalDetailsByProfessionalId(professional_id: string): Promise<ProfessionalDetails[]> {
    return new Promise(async (resolve, reject) => {
      try {
        this.logger.log('Returning all Professionals');
        if (professional_id) {
          const professionalDetails: any = await this.masterProfessionalListRepository
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
              // 'RegionInfo.id AS region_id',
              'RegionInfo.slug AS region_name',
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
            // to fetch division
            .innerJoin('master_dep_location_mapping', 'DivisionMapping', '`Professional`.`dep_id` = `DivisionMapping`.`dep_id` AND `DivisionMapping`.`location_type` = :division_location_type', { division_location_type: 18 })
            .innerJoin('master_locations', 'DivisionInfo', '`DivisionMapping`.`location_id` = `DivisionInfo`.`id`')
            // to fetch region
            .innerJoin('master_dep_location_mapping', 'RegionMapping', '`Professional`.`dep_id` = `RegionMapping`.`dep_id` AND `RegionMapping`.`location_type` = :region_location_type', { region_location_type: 109 })
            .innerJoin('master_locations', 'RegionInfo', '`RegionMapping`.`location_id` = `RegionInfo`.`id`')
            // to fetch area
            .innerJoin('master_dep_location_mapping', 'AreaMapping', '`Professional`.`dep_id` = `AreaMapping`.`dep_id` AND `AreaMapping`.`location_type` = :area_location_type', { area_location_type: 19 })
            .innerJoin('master_locations', 'AreaInfo', '`AreaMapping`.`location_id` = `AreaInfo`.`id`')
            // to fetch territory
            .innerJoin('master_dep_location_mapping', 'TerritoryMapping', '`Professional`.`dep_id` = `TerritoryMapping`.`dep_id` AND `TerritoryMapping`.`location_type` = :territory_location_type', { territory_location_type: 20 })
            .innerJoin('master_locations', 'TerritoryInfo', '`TerritoryMapping`.`location_id` = `TerritoryInfo`.`id`')
            .where("Professional.professional_id = :professional_id", { professional_id: professional_id })
            .getRawMany();

          if (!professionalDetails) {
            reject(new NotFoundException('Professional Details not found.'));
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
              if (professionalDetails[0].calendar_type == 'weekly') {
                visiting_schedule.push({ day: details.presence_weekday, time: details.visiting_time });
              } else if (professionalDetails[0].calendar_type == 'monthly') {
                visiting_schedule.push({ day: details.presence_month_date, time: details.visiting_time });
              }
            });
            professionalDetails[0]['visiting_schedule'] = visiting_schedule;
          }

          resolve(professionalDetails);
        } else {
          resolve([]);
        }
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async updateProfessional(professional_id: number, updateProfessionalMasterApiDto: UpdateProfessionalMasterApiDto[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        this.logger.log('Updating Professional Details');
        if (professional_id) {
          if (Array.isArray(updateProfessionalMasterApiDto)) {
            const apiData = updateProfessionalMasterApiDto[0];
            const image_path = 'storage/uploads/assets/images/professionals/';
            const base64_image = await this.base64_to_image(apiData.image_data, image_path, apiData.professional_id);
            if (apiData.visiting_schedule !== undefined && apiData.visiting_schedule.length > 0) {
              const updateProfessional = await this.masterProfessionalListRepository
                .createQueryBuilder()
                .update('ms_professional_list')
                .set({
                  category_id: apiData.category_id !== undefined ? Number(apiData.category_id) : null,
                  name: apiData.name !== undefined ? String(apiData.name) : null,
                  designation: apiData.designation !== undefined ? String(apiData.designation) : null,
                  department: apiData.department !== undefined ? String(apiData.department) : null,
                  organization: apiData.organization !== undefined ? String(apiData.organization) : null,
                  contact_person: apiData.contact_person !== undefined ? String(apiData.contact_person) : null,
                  mobile_number: apiData.mobile_number !== undefined ? String(apiData.mobile_number) : null,
                  academic_background: apiData.academic_background !== undefined ? String(apiData.academic_background) : null,
                  visit_fee: apiData.visit_fee !== undefined ? Number(apiData.visit_fee) : null,
                  calendar_type: apiData.calendar_type !== undefined ? String(apiData.calendar_type) : null,
                  chamber: apiData.chamber !== undefined ? String(apiData.chamber) : null,
                  territory_id: apiData.territory_id !== undefined ? Number(apiData.territory_id) : null,
                  route_id: apiData.route_id !== undefined ? Number(apiData.route_id) : null,
                  contract_value: apiData.contract_value !== undefined ? Number(apiData.contract_value) : null,
                  contract_tenure: apiData.contract_tenure !== undefined ? Number(apiData.contract_tenure) : null,
                  patients_per_week: apiData.patients_per_week !== undefined ? Number(apiData.patients_per_week) : null,
                  baby_food_prescriptions: apiData.baby_food_prescriptions !== undefined ? Number(apiData.baby_food_prescriptions) : null,
                  prescription_for_mother_smile: apiData.prescription_for_mother_smile !== undefined ? Number(apiData.prescription_for_mother_smile) : null,
                  comments: apiData.comments !== undefined ? String(apiData.comments) : null,
                  updated_by: apiData.created_by !== undefined ? Number(apiData.created_by) : null,
                })
                .where("id = :id", { id: professional_id })
                .execute();

              await this.professionalPresenceDetailsRepository
                .createQueryBuilder()
                .delete()
                .from('ms_professional_presence_details')
                .where("professional_id = :id", { id: professional_id })
                .execute();

              const scheduleData = [];
              apiData.visiting_schedule.map(details => {
                if (apiData.calendar_type == 'weekly') {
                  scheduleData.push({ professional_id: professional_id, presence_weekday: details['day'], presence_month_date: null, visiting_time: details['time'], created_by: apiData.updated_by });
                } else if (apiData.calendar_type == 'monthly') {
                  scheduleData.push({ professional_id: professional_id, presence_weekday: null, presence_month_date: details['day'], visiting_time: details['time'], created_by: apiData.updated_by });
                }
              });
              await this.professionalPresenceDetailsRepository.insert(scheduleData);
              resolve((updateProfessional.affected > 0) ? { success: true, msg: 'Professional Details Updated Successfully.' } : { success: false, msg: 'Professional Details Updated Failed.' });
            } else {
              resolve({ success: false, msg: 'Professional Details Updated Failed.' });
            }
          } else {
            resolve({ success: false, msg: 'API is Expecting Object in Array.' });
          }
        } else {
          resolve({ success: false, msg: 'Professional ID is Missing.' });
        }
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async professionalUpdateAsApproved(professionalStatusUpdateDto: ProfessionalStatusUpdateDto): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // activation_status 0 = Inactive Professional; 1 = Active Professional; 2 = Deactivate Professional
      // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
      try {
        this.logger.log('Updating Professional Status');
        const payload = { ...professionalStatusUpdateDto };
        if (payload.professional_ids.length != 0) {
          const updateProfessional = await this.masterProfessionalListRepository
            .createQueryBuilder()
            .update('ms_professional_list')
            .set({
              activation_status: 1,
              request_status: 1,
              activated_by: payload.updated_by !== undefined ? Number(payload.updated_by) : null,
              activation_date: new Date(),
              updated_by: payload.updated_by !== undefined ? Number(payload.updated_by) : null
            })
            .andWhere("ms_professional_list.id IN(:professional_ids)", { professional_ids: payload.professional_ids })
            .andWhere("ms_professional_list.activation_status IN(:activation_status)", { activation_status: [0, 2] })
            // .andWhere("ms_professional_list.request_status IN(:activation_status)", { activation_status : [0, 1, 2, 3] })
            .execute();

          resolve((updateProfessional.affected > 0) ? true : false);
        } else {
          resolve(false);
        }
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async professionalUpdateAsDecline(professionalStatusUpdateDto: ProfessionalStatusUpdateDto): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // activation_status 0 = Inactive Professional; 1 = Active Professional; 2 = Deactivate Professional
      // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
      try {
        this.logger.log('Updating Professional Status');
        const payload = { ...professionalStatusUpdateDto };
        if (payload.professional_ids.length != 0) {
          const updateProfessional = await this.masterProfessionalListRepository
            .createQueryBuilder()
            .update('ms_professional_list')
            .set({
              activation_status: 0,
              request_status: 0,
              activated_by: payload.updated_by !== undefined ? Number(payload.updated_by) : null,
              activation_date: new Date(),
              updated_by: payload.updated_by !== undefined ? Number(payload.updated_by) : null
            })
            .andWhere("ms_professional_list.id IN(:professional_ids)", { professional_ids: payload.professional_ids })
            .andWhere("ms_professional_list.activation_status IN(:activation_status)", { activation_status: [0] })
            // .andWhere("ms_professional_list.request_status IN(:activation_status)", { activation_status : [2, 3] })
            .execute();

          resolve((updateProfessional.affected > 0) ? true : false);
        } else {
          resolve(false);
        }
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async professionalUpdateAsDeactivate(professionalStatusUpdateDto: ProfessionalStatusUpdateDto): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // activation_status 0 = Inactive Professional; 1 = Active Professional; 2 = Deactivate Professional
      // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
      try {
        this.logger.log('Updating Professional Status');
        const payload = { ...professionalStatusUpdateDto };
        if (payload.professional_ids.length != 0) {
          const updateProfessional = await this.masterProfessionalListRepository
            .createQueryBuilder()
            .update('ms_professional_list')
            .set({
              activation_status: 2,
              activated_by: payload.updated_by !== undefined ? Number(payload.updated_by) : null,
              activation_date: new Date(),
              updated_by: payload.updated_by !== undefined ? Number(payload.updated_by) : null
            })
            .andWhere("ms_professional_list.id IN(:professional_ids)", { professional_ids: payload.professional_ids })
            .andWhere("ms_professional_list.activation_status IN(:activation_status)", { activation_status: [1] })
            // .andWhere("ms_professional_list.request_status IN(:activation_status)", { activation_status : [1] })
            .execute();

          resolve((updateProfessional.affected > 0) ? true : false);
        } else {
          resolve(false);
        }
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async professionalSyncCount(user_id: number, date: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        this.logger.log('Returning Professionals Sync Count.');
        if (user_id && date) {
          const professionalList = await this.masterProfessionalListRepository
            .createQueryBuilder('Professional')
            .select([
              'Professional.id AS id',
              'Professional.professional_id AS professional_id'
            ])
            .where("Professional.created_by = :user_id", { user_id: user_id })
            .andWhere("DATE(Professional.request_date) = :date", { date: date })
            .getRawMany();

          if (professionalList.length > 0) {
            resolve({ success: true, msg: 'Professional Data Count Found Successfully.', data: professionalList.length });
          } else {
            resolve({ success: false, msg: 'Professional Data is Empty.', data: 0 });
          }
        } else {
          resolve({ success: false, msg: 'API is Expecting User ID & Date.', data: 0 });
        }
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async prepareProfessionalId(category_id: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const professionalCategory = await this.professionalCategoryRepository.findOne({
          where: {
            id: category_id,
            status: 1
          }
        });
        const professionalList: any = await this.masterProfessionalListRepository.find();
        const professional_id = professionalCategory.id_creation + await this.addingExtraZeros(String(professionalList.length + 1), 5);
        resolve(professional_id);
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async addingExtraZeros(str: string, max: number) {
    try {
      str = str.toString();
      return str.length < max ? await this.addingExtraZeros("0" + str, max) : str;
    } catch (error) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  async base64_to_image(base64Data: string, image_path: string, image_name: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        base64Data = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");
        const temp_path = '../' + image_path;
        if (!fs.existsSync(temp_path)) {
          fs.mkdirSync(temp_path, { recursive: true });
        }
        const image_path_and_name = temp_path + image_name + '.jpg';
        require('fs').writeFile(image_path_and_name, base64Data, 'base64', function (err) {
          if (err == 'null') return true;
          else return err;
        });
        resolve(true);
      } catch (error) {
        reject(false);
      }
    })
  }

}
