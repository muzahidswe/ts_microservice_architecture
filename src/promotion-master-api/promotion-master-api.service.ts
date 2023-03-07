import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterPromotionRepository } from 'src/database_table/repository/master-promotion.repository';
import { MsPdoWisePromotionLimitRepository } from 'src/database_table/repository/ms-pdo-wise-promotion-limit.repository';
import { PromotionCategoryRepository } from 'src/database_table/repository/ms_promotion_category.repository';
import { CreatePromotionMasterApiDto } from './dto/create-promotion-master-api.dto';
import { PromotionStatusUpdateDto, UpdatePromotionMasterApiDto } from './dto/update-promotion-master-api.dto';

@Injectable()
export class PromotionMasterApiService {
  private readonly logger = new Logger(PromotionMasterApiService.name);
  constructor(
    @InjectRepository(MasterPromotionRepository)
    private readonly masterPromotionRepository: MasterPromotionRepository,

    @InjectRepository(PromotionCategoryRepository)
    private readonly promotionCategoryRepository: PromotionCategoryRepository,

    @InjectRepository(MsPdoWisePromotionLimitRepository)
    private readonly msPdoWisePromotionLimitRepository: MsPdoWisePromotionLimitRepository,
  ) {
  }

  async promotionCategoryList(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.logger.log('Returning all Promotion Category');
      try {
        const category = await this.promotionCategoryRepository
          .createQueryBuilder('Category')
          .select([
            'Category.id AS category_id',
            'Category.name AS category_name',
            'Category.name_bn AS category_name_bn',
            'Category.keyword as category_keyword'
          ])
          .where("Category.status = :status", { status: 1 })
          .getRawMany();

        if (!category) {
          reject(new NotFoundException('Promotion Category not found.'));
        }
        resolve(category);
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async create_promotion(CreatePromotionMasterApiDto: CreatePromotionMasterApiDto[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.logger.log('Adding New Promotion');
      try {
        // const promotionId = await this.preparePromotionId(Number(CreatePromotionMasterApiDto.promotion_category_id));
        if (Array.isArray(CreatePromotionMasterApiDto)) {
          if (CreatePromotionMasterApiDto.length != 0) {
            const currentdate = new Date();
            const year = currentdate.getFullYear();
            const month = (currentdate.getMonth() + 1);
            for (const promotion of CreatePromotionMasterApiDto) {
              // delete previous data if exists
              await this.masterPromotionRepository
                .createQueryBuilder()
                .delete()
                .from('ms_promotion_list')
                .where("promotion_id = :id", { id: promotion.promotion_id })
                .execute();


              const promotionLimit = await this.msPdoWisePromotionLimitRepository
                .createQueryBuilder('Promotion')
                .select([
                  'Promotion.remaining_balance AS remaining_balance',
                  'Promotion.expenses AS expenses'
                ])
                .where("Promotion.status = :status", { status: 1 })
                .andWhere("Promotion.dep_id = :dep_id", { dep_id: promotion.dep_id })
                .andWhere("Promotion.ff_id = :ff_id", { ff_id: promotion.ff_id })
                .andWhere("Promotion.month = :month", { month: month })
                .andWhere("Promotion.year = :year", { year: year })
                .limit(1)
                .getRawMany();

              if (promotionLimit.length != 0) {
                let remain_balance = promotionLimit[0].remaining_balance;
                if (remain_balance > promotion.promotion_value) {
                  const insertData = {
                    "promotion_id": String(promotion.promotion_id),
                    "promotion_category_id": promotion.promotion_category_id !== undefined ? Number(promotion.promotion_category_id) : null,
                    "professional_id": promotion.professional_id !== undefined ? Number(promotion.professional_id) : null,
                    "promotion_description": promotion.promotion_description !== undefined ? String(promotion.promotion_description) : null,
                    "promotion_value": promotion.promotion_value !== undefined ? Number(promotion.promotion_value) : null,
                    "usable_value": promotion.usable_value !== undefined ? Number(promotion.usable_value) : null,
                    "comments": promotion.comments !== undefined ? String(promotion.comments) : null,
                    "activation_status": 0, // activation_status 0 = Inactive Promotion; 1 = Active Promotion; 2 = Deactivate Promotion
                    "request_status": 3,    // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
                    "request_date": new Date(),
                    "created_by": promotion.created_by !== undefined ? Number(promotion.created_by) : null,
                  };
                  const insertLog = await this.masterPromotionRepository.insert(insertData);

                  const limitUpdate = await this.msPdoWisePromotionLimitRepository
                    .createQueryBuilder()
                    .update('ms_pdo_wise_promotion_limit')
                    .set({
                      remaining_balance: () => `remaining_balance - ${promotion.promotion_value}`,
                      expenses: () => `expenses + ${promotion.promotion_value}`
                    })
                    .where("status = :status", { status: 1 })
                    .andWhere("dep_id = :dep_id", { dep_id: promotion.dep_id })
                    .andWhere("ff_id = :ff_id", { ff_id: promotion.ff_id })
                    .andWhere("month = :month", { month: month })
                    .andWhere("year = :year", { year: year })
                    .execute();
                  // resolve ((insertLog.identifiers[0].id > 0) ? {success: true, msg : 'Promotion Added Successfully.'} : {success: false, msg : 'Promotion Added Failed.'});  
                } else {
                  resolve({ success: false, msg: `You dont have enougth Limit. Your remaining limit is ${remain_balance}` });
                }
              } else {
                resolve({ success: false, msg: 'You have no Promotion Limit.' });
              }
            }
            resolve({ success: true, msg: 'Promotion Added Successfully.' });
          } else {
            resolve({ success: false, msg: 'Promotion Data Not Found.' });
          }
        } else {
          resolve({ success: false, msg: 'API is Expecting Object in Array' });
        }
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async byProfessionalPromotionSummary(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.logger.log('Returning all Promotion');
      try {
        const promotionInfo = await this.masterPromotionRepository
          .createQueryBuilder('Promotion')
          .select([
            'professionalInfo.category_id AS professional_category_id',
            'Promotion.professional_id AS professional_id',
            'professionalInfo.name AS professional_name',
            'professionalInfo.designation AS designation',
            'professionalInfo.department AS department',
            'professionalInfo.organization AS organization',
            'SUM(Promotion.promotion_value) AS promotion_value',
            'SUM(Promotion.usable_value) AS usable_value'
          ])
          // activation_status 0 = Inactive Promotion; 1 = Active Promotion; 2 = Deactivate Promotion
          .addSelect(`CASE
                WHEN professionalInfo.activation_status = 0 THEN 'Inactive'
                WHEN professionalInfo.activation_status = 1 THEN 'Active'
                WHEN professionalInfo.activation_status = 2 THEN 'Deactivate'
              END`, 'activation_status')
          // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
          .addSelect(`CASE
                WHEN professionalInfo.request_status = 0 THEN 'Decline'
                -- WHEN professionalInfo.request_status = 1 THEN 'Approved'
                WHEN professionalInfo.request_status = 2 THEN 'Edit'
                WHEN professionalInfo.request_status = 3 THEN 'New'
              END`, 'request_status')
          .innerJoin('ms_professional_list', 'professionalInfo', '`professionalInfo`.`id` = `Promotion`.`professional_id`')
          // .where("Promotion.activation_status = :activation_status", { activation_status: 1 })
          .groupBy('Promotion.professional_id')
          .orderBy('Promotion.professional_id', 'DESC')
          .getRawMany();

        if (!promotionInfo) {
          reject(new NotFoundException('Promotion List not found.'));
        }
        resolve(promotionInfo);
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async byProfessionalPromotionList(params): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.logger.log('Returning By Professional Promotion List');
      try {
        let { professional_id, limit } = params;
        const dateRange = await this.calculateDateRange(limit);
        const promotionInfo = await this.masterPromotionRepository
          .createQueryBuilder('Promotion')
          .select([
            'Promotion.id as id',
            'category.name AS category_name',
            'Promotion.promotion_category_id AS promotion_category_id',
            'Promotion.professional_id AS professional_id',
            'Promotion.promotion_id AS promotion_id',
            'Promotion.promotion_value AS promotion_value',
            'Promotion.usable_value AS usable_value',
            'Promotion.promotion_description AS promotion_description',
            'Promotion.comments AS comments',
            'Promotion.created_by AS issued_by',
            'DATE_FORMAT(Promotion.created, "%Y-%m-%d") as created_date'
          ])
          .innerJoin('ms_promotion_category', 'category', 'category.id = Promotion.promotion_category_id')
          // activation_status 0 = Inactive Promotion; 1 = Active Promotion; 2 = Deactivate Promotion
          .addSelect(`CASE
              WHEN Promotion.activation_status = 0 THEN 'Inactive'
              WHEN Promotion.activation_status = 1 THEN 'Active'
              WHEN Promotion.activation_status = 2 THEN 'Deactivate'
            END`, 'activation_status')
          // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
          .addSelect(`CASE
              WHEN Promotion.request_status = 0 THEN 'Decline'
              WHEN Promotion.request_status = 1 THEN 'Approved'
              WHEN Promotion.request_status = 2 THEN 'Edit'
              WHEN Promotion.request_status = 3 THEN 'New'
            END`, 'request_status')
          .where("Promotion.status = :status", { status: 1 })
          .where("Promotion.professional_id = :professional_id", { professional_id: professional_id })
          .andWhere(`DATE(Promotion.created) BETWEEN '${dateRange.start_date}' AND '${dateRange.last_date}'`)
          .orderBy('Promotion.id', 'DESC')
          .getRawMany();

        if (!promotionInfo) {
          reject(new NotFoundException('Promotion List not found.'));
        }
        resolve(promotionInfo);
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async promotionDetailsById(promotion_id: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.logger.log('Returning By Professional Promotion List');
      try {
        if (promotion_id) {
          const promotionInfo = await this.masterPromotionRepository
            .createQueryBuilder('Promotion')
            .select([
              'Promotion.id AS id',
              'Promotion.promotion_id AS promotion_id',
              'professionalInfo.professional_id AS professional_id',
              'Promotion.promotion_category_id AS promotion_category_id',
              'PromotionCategory.name AS promotion_category_name',
              'professionalInfo.name AS professional_name',
              'professionalInfo.designation AS designation',
              'professionalInfo.dob AS dob',
              'professionalInfo.department AS department',
              'professionalInfo.organization AS organization',
              'professionalInfo.mobile_number AS mobile_number',
              'professionalInfo.contract_value AS contract_value',
              'Promotion.promotion_value AS promotion_value',
              'Promotion.promotion_description AS promotion_description',
              'Promotion.comments AS promotion_comment',
              'Promotion.created_by AS issued_by',
              'DATE_FORMAT(Promotion.activation_date, "%Y-%m-%d") as activation_date',
              'DATE_FORMAT(Promotion.request_date, "%Y-%m-%d") as request_date'
            ])
            // activation_status 0 = Inactive Promotion; 1 = Active Promotion; 2 = Deactivate Promotion
            .addSelect(`CASE
                WHEN Promotion.activation_status = 0 THEN 'Inactive'
                WHEN Promotion.activation_status = 1 THEN 'Active'
                WHEN Promotion.activation_status = 2 THEN 'Deactivate'
              END`, 'activation_status')
            // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
            .addSelect(`CASE
                WHEN Promotion.request_status = 0 THEN 'Decline'
                WHEN Promotion.request_status = 1 THEN 'Approved'
                WHEN Promotion.request_status = 2 THEN 'Edit'
                WHEN Promotion.request_status = 3 THEN 'New'
              END`, 'request_status')
            .innerJoin('ms_professional_list', 'professionalInfo', '`professionalInfo`.`id` = `Promotion`.`professional_id`')
            .innerJoin('ms_promotion_category', 'PromotionCategory', '`Promotion`.`promotion_category_id` = `PromotionCategory`.`id`')
            // .where("Promotion.activation_status = :activation_status", { activation_status: 1 })
            .where("Promotion.id = :promotion_id", { promotion_id: promotion_id })
            .getRawMany();

          if (!promotionInfo) {
            throw new NotFoundException('Promotion List not found.');
          }
          resolve(promotionInfo);
        } else {
          resolve([]);
        }
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async preparePromotionId(promotion_category_id: number) {
    try {
      const promotionCategory = await this.promotionCategoryRepository.findOne({
        where: {
          id: promotion_category_id,
          status: 1
        }
      });
      const promotionList = await this.masterPromotionRepository.find();
      const promotion_id = promotionCategory.id_creation + await this.addingExtraZeros(String(promotionList.length + 1), 5);
      return promotion_id;
    } catch (error) {
      console.log(error);
      // throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      throw new HttpException({ status: HttpStatus.FORBIDDEN, error: 'Forbidden' }, HttpStatus.FORBIDDEN);
    }
  }

  async addingExtraZeros(str: string, max: number) {
    try {
      str = str.toString();
      return str.length < max ? await this.addingExtraZeros("0" + str, max) : str;
    } catch (error) {
      // throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      throw new HttpException({ status: HttpStatus.FORBIDDEN, error: 'Forbidden' }, HttpStatus.FORBIDDEN);
    }
  }

  async updatePromotion(id: number, updatePromotionMasterApiDto: UpdatePromotionMasterApiDto[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.logger.log('Updating Promotion Details');
      try {
        if (updatePromotionMasterApiDto[0] && updatePromotionMasterApiDto[0].promotion_category_id != undefined) {
          const updatePromotion = await this.masterPromotionRepository
            .createQueryBuilder()
            .update('ms_promotion_list')
            .set({
              promotion_category_id: updatePromotionMasterApiDto[0].promotion_category_id,
              professional_id: updatePromotionMasterApiDto[0].professional_id,
              promotion_description: updatePromotionMasterApiDto[0].promotion_description,
              promotion_value: updatePromotionMasterApiDto[0].promotion_value,
              usable_value: updatePromotionMasterApiDto[0].usable_value,
              comments: updatePromotionMasterApiDto[0].comments,
              updated_by: updatePromotionMasterApiDto[0].updated_by
            })
            .where("id = :id", { id: id })
            .execute();

          resolve((updatePromotion.affected > 0) ? true : false);
        } else {
          resolve(false);
        }
      } catch (errror) {
        console.log(errror);
        reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }
    });
  }

  async promotionUpdateAsApproved(promotionStatusUpdateDto: PromotionStatusUpdateDto): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.logger.log('Updating Promotion Status');
      // activation_status 0 = Inactive Professional; 1 = Active Professional; 2 = Deactivate Professional
      // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
      try {
        const payload = { ...promotionStatusUpdateDto };
        if (payload.promotion_ids.length != 0) {
          const updateProfessional = await this.masterPromotionRepository
            .createQueryBuilder()
            .update('ms_promotion_list')
            .set({
              activation_status: 1,
              request_status: 1,
              activated_by: payload.updated_by !== undefined ? Number(payload.updated_by) : null,
              activation_date: new Date(),
              updated_by: payload.updated_by !== undefined ? Number(payload.updated_by) : null
            })
            .andWhere("ms_promotion_list.id IN(:promotion_ids)", { promotion_ids: payload.promotion_ids })
            .andWhere("ms_promotion_list.activation_status IN(:activation_status)", { activation_status: [0, 2] })
            // .andWhere("ms_promotion_list.request_status IN(:activation_status)", { activation_status : [0, 1, 2, 3] })
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

  async promotionUpdateAsDecline(promotionStatusUpdateDto: PromotionStatusUpdateDto): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.logger.log('Updating Promotion Status');
      // activation_status 0 = Inactive Professional; 1 = Active Professional; 2 = Deactivate Professional
      // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
      try {
        const payload = { ...promotionStatusUpdateDto };
        if (payload.promotion_ids.length != 0) {
          const updateProfessional = await this.masterPromotionRepository
            .createQueryBuilder()
            .update('ms_promotion_list')
            .set({
              activation_status: 0,
              request_status: 0,
              activated_by: payload.updated_by !== undefined ? Number(payload.updated_by) : null,
              activation_date: new Date(),
              updated_by: payload.updated_by !== undefined ? Number(payload.updated_by) : null
            })
            .andWhere("ms_promotion_list.id IN(:promotion_ids)", { promotion_ids: payload.promotion_ids })
            .andWhere("ms_promotion_list.activation_status IN(:activation_status)", { activation_status: [0] })
            // .andWhere("ms_promotion_list.request_status IN(:activation_status)", { activation_status : [2, 3] })
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

  async promotionUpdateAsDeactivate(promotionStatusUpdateDto: PromotionStatusUpdateDto): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.logger.log('Updating Promotion Status');
      // activation_status 0 = Inactive Professional; 1 = Active Professional; 2 = Deactivate Professional
      // request_status 0 = Decline Request; 1 = Approved Request; 2 = Edit Request; 3 = New Request
      try {
        const payload = { ...promotionStatusUpdateDto };
        if (payload.promotion_ids.length != 0) {
          const updateProfessional = await this.masterPromotionRepository
            .createQueryBuilder()
            .update('ms_promotion_list')
            .set({
              activation_status: 2,
              activated_by: payload.updated_by !== undefined ? Number(payload.updated_by) : null,
              activation_date: new Date(),
              updated_by: payload.updated_by !== undefined ? Number(payload.updated_by) : null
            })
            .andWhere("ms_promotion_list.id IN(:promotion_ids)", { promotion_ids: payload.promotion_ids })
            .andWhere("ms_promotion_list.activation_status IN(:activation_status)", { activation_status: [1] })
            // .andWhere("ms_promotion_list.request_status IN(:activation_status)", { activation_status : [1] })
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

  async promotionSyncCount(user_id: number, date: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        this.logger.log('Returning Promotion Sync Count.');
        if (user_id && date) {
          const promotionList = await this.masterPromotionRepository
            .createQueryBuilder('Promotion')
            .select([
              'Promotion.professional_id AS professional_id',
            ])
            .where("Promotion.created_by = :user_id", { user_id: user_id })
            .andWhere("DATE(Promotion.request_date) = :date", { date: date })
            .getRawMany();

          if (promotionList.length > 0) {
            resolve({ success: true, msg: 'Promotion Data Count Found Successfully.', data: promotionList.length });
          } else {
            resolve({ success: false, msg: 'Promotion Data is Empty.', data: 0 });
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

  async calculateDateRange(limit: string) {
    try {
      const currentdate = new Date();
      let firstday: Date, lastday: Date, firstDayRange: string, lastDayRange: string;
      if (limit == 'all') {
        firstday = await this.getFirstDayOfYear(2022);
        lastday = currentdate;
      }
      else if (limit == 'week') {
        firstday = new Date(currentdate.setDate(currentdate.getDate() - currentdate.getDay()));
        lastday = new Date(currentdate.setDate(currentdate.getDate() - currentdate.getDay() + 6));
      }
      else if (limit == 'month') {
        firstday = new Date(currentdate.getFullYear(), currentdate.getMonth(), 1);
        lastday = new Date(currentdate.getFullYear(), currentdate.getMonth() + 1, 0);
      }
      else if (limit == 'lastmonth') {
        firstday = new Date(currentdate.getFullYear(), currentdate.getMonth() - 1, 1);
        lastday = new Date(currentdate.getFullYear(), currentdate.getMonth() - 1 + 1, 0);
      }
      firstDayRange = firstday.getFullYear() + "-" + ('0' + (firstday.getMonth() + 1)).slice(-2) + "-" + ('0' + firstday.getDate()).slice(-2);
      lastDayRange = lastday.getFullYear() + "-" + ('0' + (lastday.getMonth() + 1)).slice(-2) + "-" + ('0' + lastday.getDate()).slice(-2);
      return { "start_date": firstDayRange, "last_date": lastDayRange };
    } catch (errror) {
      // throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      throw new HttpException({ status: HttpStatus.FORBIDDEN, error: 'Forbidden' }, HttpStatus.FORBIDDEN);
    }
  }

  async getFirstDayOfYear(year: number) {
    return new Date(year, 0, 1);
  }

}
