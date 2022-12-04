import { EntityRepository, Repository } from "typeorm";
import { MasterPromotionEntity } from "../entitites/master-promotion.entity";

@EntityRepository(MasterPromotionEntity)
export class MasterPromotionRepository extends Repository<MasterPromotionEntity> {
    
}